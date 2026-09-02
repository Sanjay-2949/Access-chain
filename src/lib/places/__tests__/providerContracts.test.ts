import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';
import { SingleFlight } from '../../gateway/SingleFlight';
import { evaluateAccessDecision } from '../../routing/accessibilityEngine';
import { CONFIDENCE_CEILINGS, CanonicalPlace } from '../types';

describe('Provider Contract Tests (Schema Stability)', () => {
  // 1. Google Places (New) Contract
  it('Google Contract: maps Google Place Details DTO into CanonicalPlace schema', () => {
    const googleDto = {
      id: 'places/ChIJgUb9x52_UjoRndDwLiQtRi4',
      displayName: { text: 'Jeppiaar Engineering College' },
      formattedAddress: 'Semmancheri, Chennai, Tamil Nadu 600119, India',
      location: { latitude: 12.8718, longitude: 80.2198 },
    };

    const canonical = PlaceNormalizer.fromGoogleDetails(googleDto);
    expect(canonical.id).toBe('places/ChIJgUb9x52_UjoRndDwLiQtRi4');
    expect(canonical.name).toBe('Jeppiaar Engineering College');
    expect(canonical.coordinates.lat).toBe(12.8718);
    expect(canonical.coordinates.lng).toBe(80.2198);
    expect(canonical.locationAccuracy).toBe('rooftop');
    expect(canonical.verificationStatus).toBe('provider_verified');
    expect(canonical.confidence).toBeLessThanOrEqual(CONFIDENCE_CEILINGS.provider_verified);
    expect(canonical.accessPoints).toBeDefined();
    expect(canonical.accessPoints!.length).toBeGreaterThan(0);
  });

  // 2. Nominatim OpenStreetMap Contract
  it('Nominatim Contract: maps OSM feature DTO into CanonicalPlace schema', () => {
    const osmDto = {
      place_id: 987654,
      osm_type: 'node',
      name: 'Main Gate Wheelchair Entrance',
      display_name: 'Main Gate Wheelchair Entrance, Campus Road, Chennai, Tamil Nadu, 600100, India',
      lat: '12.9456',
      lon: '80.2080',
      extratags: { wheelchair: 'yes' },
      address: {
        road: 'Campus Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postcode: '600100',
        country: 'India',
        country_code: 'in',
      },
    };

    const canonical = PlaceNormalizer.fromNominatim(osmDto);
    expect(canonical.id).toBe('osm-987654');
    expect(canonical.name).toBe('Main Gate Wheelchair Entrance');
    expect(canonical.locationAccuracy).toBe('entrance');
    expect(canonical.accessPoints![0].type).toBe('wheelchair_entrance');
    expect(canonical.accessPoints![0].isPrimaryWheelchairEntrance).toBe(true);
    expect(canonical.verificationStatus).toBe('community_audited');
    expect(canonical.confidence).toBeLessThanOrEqual(CONFIDENCE_CEILINGS.community_audited);
  });

  // 3. Photon Komoot Geocoder Contract
  it('Photon Contract: maps Photon GeoJSON feature into CanonicalPlace schema', () => {
    const photonFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [80.2080, 12.9456] },
      properties: {
        osm_id: 554433,
        name: 'Jerusalem College',
        street: 'Velachery Main Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        countrycode: 'IN',
      },
    };

    const canonical = PlaceNormalizer.fromPhoton(photonFeature);
    expect(canonical.id).toBe('photon-554433');
    expect(canonical.name).toBe('Jerusalem College');
    expect(canonical.coordinates.lat).toBe(12.9456);
    expect(canonical.coordinates.lng).toBe(80.2080);
    expect(canonical.verificationStatus).toBe('inferred');
    expect(canonical.confidence).toBeLessThanOrEqual(CONFIDENCE_CEILINGS.inferred);
  });
});

describe('Single-Flight Request Coalescing & Concurrency', () => {
  let singleFlight: SingleFlight;

  beforeEach(() => {
    singleFlight = new SingleFlight();
  });

  it('coalesces 50 concurrent identical requests into 1 single upstream invocation', async () => {
    let upstreamCallCount = 0;

    const mockUpstreamFetcher = vi.fn(async () => {
      upstreamCallCount++;
      await new Promise((r) => setTimeout(r, 20));
      return { data: 'Jeppiaar University', count: upstreamCallCount };
    });

    // Fire 50 simultaneous identical queries
    const requests = Array.from({ length: 50 }, () =>
      singleFlight.do('query:jeppiaar', mockUpstreamFetcher)
    );

    const results = await Promise.all(requests);

    // All 50 consumers received the identical resolved object
    expect(results.length).toBe(50);
    results.forEach((res) => expect(res.data).toBe('Jeppiaar University'));

    // Upstream was called EXACTLY ONCE
    expect(upstreamCallCount).toBe(1);
    expect(singleFlight.getInFlightCount()).toBe(0);
  });

  it('failure eviction: failed requests are cleanly removed and do not poison subsequent requests', async () => {
    let attempt = 0;

    const flakyFetcher = async () => {
      attempt++;
      if (attempt === 1) {
        throw new Error('503 Service Unavailable');
      }
      return 'Success on retry';
    };

    // Attempt 1 fails
    await expect(singleFlight.do('query:flaky', flakyFetcher)).rejects.toThrow('503');
    expect(singleFlight.getInFlightCount()).toBe(0);

    // Attempt 2 succeeds cleanly
    const res2 = await singleFlight.do('query:flaky', flakyFetcher);
    expect(res2).toBe('Success on retry');
  });
});

describe('Entrance-Selection Policy (Accessibility Routing Engine)', () => {
  it('selects verified wheelchair entrance over building centroid', () => {
    const placeWithWheelchairEntrance: any = {
      placeId: 'jce-place',
      name: 'Jerusalem College of Engineering',
      lat: 12.9450, // Building centroid
      lng: 80.2070,
      accessPoints: [
        {
          id: 'ap-ramp',
          coordinates: { lat: 12.9456, lng: 80.2080 }, // Exact ramp coordinates
          type: 'wheelchair_entrance',
          source: 'field_verified',
          baseConfidence: 98,
          effectiveConfidence: 98,
          stalenessTier: 'FRESH',
          ageInDays: 10,
          isPrimaryWheelchairEntrance: true,
        },
      ],
    };

    const decision = evaluateAccessDecision(placeWithWheelchairEntrance);
    expect(decision.selectionReason).toBe('wheelchair_entrance');
    expect(decision.selectedAccessPointId).toBe('ap-ramp');
    expect(decision.destination.lat).toBe(12.9456); // Routes to ramp, not centroid!
    expect(decision.destination.lng).toBe(80.2080);
    expect(decision.effectiveConfidence).toBe(98);
  });

  it('falls back to building centroid when no access point exists, flagging caution warning', () => {
    const placeWithoutEntrance: any = {
      placeId: 'unknown-place',
      name: 'Unverified Building',
      lat: 12.9602,
      lng: 80.2015,
    };

    const decision = evaluateAccessDecision(placeWithoutEntrance);
    expect(decision.selectionReason).toBe('building_centroid');
    expect(decision.warnings.length).toBeGreaterThan(0);
    expect(decision.effectiveConfidence).toBeLessThanOrEqual(50);
  });
});
