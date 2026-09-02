import { describe, it, expect, beforeEach } from 'vitest';
import { HybridPlacesProvider } from '../providers/HybridPlacesProvider';
import { CircuitBreaker, CircuitState, ErrorSeverity } from '../../gateway/CircuitBreaker';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';
import { GeoValidator } from '../../gateway/GeoValidator';
import { GatewayMetrics } from '../../gateway/GatewayMetrics';
import { globalGatewayCache } from '../../gateway/CacheService';

describe('Production Places & Autocomplete Test Matrix', () => {
  let hybridProvider: HybridPlacesProvider;

  beforeEach(() => {
    globalGatewayCache.clear();
    GatewayMetrics.clear();
    hybridProvider = new HybridPlacesProvider('TEST_API_KEY');
  });

  // 1. Jeppiaar -> Ranked places & Canonical details
  it('Scenario: "Jeppiaar" query returns ranked places with explicit provenance and confidence', async () => {
    const results = await hybridProvider.autocomplete('Jeppiaar', {
      proximityCoordinates: { lat: 12.9602, lng: 80.2015 },
    });

    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.primaryText).toContain('Jeppiaar');

    // Canonical details
    const details = await hybridProvider.getPlaceDetails(topResult.placeId);
    expect(details).not.toBeNull();
    expect(details?.name).toContain('Jeppiaar');
    expect(details?.coordinates.lat).toBeGreaterThan(12);
    expect(['entrance', 'building', 'rooftop']).toContain(details?.locationAccuracy);
    expect(details?.verificationStatus).toBeDefined();
    expect(details?.confidence).toBeGreaterThanOrEqual(70);
    expect(details?.address.city).toBe('Chennai');
  });

  // 2. Unknown text -> Empty state (No blind cascade hallucination)
  it('Scenario: Random unknown text returns empty state without blind fallback', async () => {
    const results = await hybridProvider.autocomplete('xyzqwe987nonexistentplace', {
      proximityCoordinates: { lat: 12.9602, lng: 80.2015 },
    });
    expect(results).toEqual([]);
  });

  // 3. Repeated query -> LRU / Cache hit
  it('Scenario: Same query repeated hits in-memory cache with 0ms overhead', async () => {
    const firstCall = await hybridProvider.autocomplete('Tropical', {
      proximityCoordinates: { lat: 12.9602, lng: 80.2015 },
    });

    const cached = globalGatewayCache.get('ac:tropical:12.9602:80.2015');
    expect(cached).toBeDefined();
    expect(cached).toEqual(firstCall);

    const secondCall = await hybridProvider.autocomplete('Tropical', {
      proximityCoordinates: { lat: 12.9602, lng: 80.2015 },
    });
    expect(secondCall).toEqual(firstCall);
  });

  // 4. Circuit Breaker Granular Error Classification
  it('Scenario: Circuit Breaker correctly classifies error severities', () => {
    const breaker = new CircuitBreaker('MatrixBreaker');

    expect(breaker.classifyError(new Error('429 RESOURCE_EXHAUSTED'))).toBe(ErrorSeverity.QUOTA_EXHAUSTED);
    expect(breaker.classifyError(new Error('401 API_KEY_INVALID'))).toBe(ErrorSeverity.AUTH_FAILURE);
    expect(breaker.classifyError(new Error('400 INVALID_ARGUMENT'))).toBe(ErrorSeverity.CLIENT_ERROR);
    expect(breaker.classifyError(new Error('Request timed out after 3500ms'))).toBe(ErrorSeverity.TRANSIENT);
  });

  // 5. Accuracy & AccessPointType distinction
  it('Scenario: Rooftop is distinguished from verified pedestrian/wheelchair entrance', () => {
    const entrancePlace = PlaceNormalizer.fromNominatim({
      place_id: 101,
      osm_type: 'node',
      name: 'Main Gate',
      display_name: 'Main Gate, Campus Rd, Chennai, India',
      lat: '12.9456',
      lon: '80.2080',
      address: { city: 'Chennai', country: 'India' },
    });

    expect(entrancePlace.locationAccuracy).toBe('entrance');
    expect(entrancePlace.selectedAccessPoint?.type).toBe('pedestrian_entrance');
    expect(entrancePlace.verificationStatus).toBe('community_audited');

    const rooftopPlace = PlaceNormalizer.fromGoogleDetails({
      id: 'g-102',
      displayName: { text: 'Admin Building' },
      formattedAddress: 'Admin Block, Chennai',
      geometry: { location: { lat: 12.9458, lng: 80.2082 }, location_type: 'ROOFTOP' },
    });

    expect(rooftopPlace.locationAccuracy).toBe('rooftop');
    expect(rooftopPlace.selectedAccessPoint?.type).toBe('main_entrance');
    expect(rooftopPlace.verificationStatus).toBe('provider_verified');
  });

  // 6. Geospatial bounds and coordinate validation
  it('Scenario: GeoValidator properly validates, bounds-checks, and formats coordinates', () => {
    expect(GeoValidator.isValidCoordinate(12.9456, 80.2080)).toBe(true);
    expect(GeoValidator.isValidCoordinate(95.0, 80.0)).toBe(false); // Invalid lat
    expect(GeoValidator.isWithinBounds(12.9456, 80.2080)).toBe(true);
    expect(GeoValidator.formatCoordinatesReadable(12.9456, 80.2080)).toBe('12.9456° N, 80.2080° E');
  });

  // 7. Gateway observability telemetry
  it('Scenario: GatewayMetrics records latency and calculates cache hit ratios', () => {
    GatewayMetrics.record({ provider: 'local', latencyMs: 2, success: true, cacheHit: true, timestamp: new Date().toISOString() });
    GatewayMetrics.record({ provider: 'google', latencyMs: 120, success: true, cacheHit: false, timestamp: new Date().toISOString() });

    const stats = GatewayMetrics.getStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.cacheHitRatio).toBe(50);
    expect(stats.averageLatencyMs).toBe(61);
  });
});
