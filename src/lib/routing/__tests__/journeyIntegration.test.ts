import { describe, it, expect, beforeEach } from 'vitest';
import { HybridPlacesProvider } from '../../places/providers/HybridPlacesProvider';
import { computeRoute, evaluateAccessDecision } from '../accessibilityEngine';
import { globalGatewayCache } from '../../gateway/CacheService';
import { TemporalService } from '../../gateway/TemporalService';
import { AccessibilityProfile } from '../../../stores/useAppStore';

describe('Full Journey End-to-End Accessibility Navigation Pipeline', () => {
  let hybridProvider: HybridPlacesProvider;
  const wheelchairProfile: AccessibilityProfile = {
    mobility: {
      wheelchair: true,
      wheelchairWidth: 70, // 70cm = 700mm
      walkingAid: false,
      limitedWalking: false,
      maxWalkingDistance: 200,
    },
    vision: { visualAssistance: false, highContrast: false },
    hearing: { visualNotifications: false },
    cognitive: { simplifiedInstructions: false, fewerTransfers: false },
    speech: { textFirst: false },
  };

  beforeEach(() => {
    globalGatewayCache.clear();
    hybridProvider = new HybridPlacesProvider('TEST_API_KEY');
  });

  // 1. Complete Unbroken E2E Chain
  it('E2E Pipeline: Search -> CanonicalPlace -> AccessPoint -> AccessDecision -> Route terminates at exact ramp coordinates', async () => {
    // A. Autocomplete Search
    const searchSuggestions = await hybridProvider.autocomplete('Jeppiaar Engineering', {
      proximityCoordinates: { lat: 12.9602, lng: 80.2015 },
    });
    expect(searchSuggestions.length).toBeGreaterThan(0);
    const topSuggestion = searchSuggestions[0];
    expect(topSuggestion.primaryText).toContain('Jeppiaar');

    // B. Canonical Place Details
    const canonicalPlace = await hybridProvider.getPlaceDetails(topSuggestion.placeId);
    expect(canonicalPlace).not.toBeNull();
    expect(canonicalPlace?.id).toBe('loc-jeppiaar-eng');
    expect(canonicalPlace?.accessPoints).toBeDefined();

    // C. Route Computation with Wheelchair Profile
    const origin = {
      placeId: 'origin-1',
      name: 'User Current Location',
      address: 'Medavakkam Koot Road, Chennai',
      lat: 12.9210,
      lng: 80.1915,
    };

    const journey = await computeRoute(origin, canonicalPlace as any, wheelchairProfile);

    // D. Assert Unbroken Pipeline & Precise Ramp Landing
    expect(journey.feasible).toBe(true);
    expect(journey.accessDecision).toBeDefined();
    expect(journey.accessDecision?.canonicalPlaceId).toBe('loc-jeppiaar-eng');
    expect(journey.accessDecision?.selectedAccessPointId).toBe('ap-jeppiaar-main');
    expect(journey.accessDecision?.selectionReason).toBe('wheelchair_entrance');
    expect(journey.accessDecision?.verificationStatus).toBe('field_verified');
    expect(journey.accessDecision?.stalenessTier).toBe('FRESH');
    expect(journey.accessDecision?.effectiveConfidence).toBe(98);

    // Final route destination coordinates MUST match exact ramp coordinates (12.8718, 80.2198), NOT centroid
    expect(journey.destination.lat).toBe(12.8718);
    expect(journey.destination.lng).toBe(80.2198);
  });

  // 2. Constraint-First Filtering: Rejects 1:8 Steep Ramp and Audits Rejection
  it('Constraint-First: selects 1:12 compliant ramp and rejects 1:8 steep ramp with audit trail', () => {
    const campusWithTwoEntrances: any = {
      placeId: 'loc-jeppiaar-eng',
      name: 'Jeppiaar Engineering College',
      lat: 12.8700, // Centroid
      lng: 80.2180,
      accessPoints: [
        {
          id: 'ap-gate-2',
          coordinates: { lat: 12.8725, lng: 80.2205 },
          type: 'wheelchair_entrance',
          source: 'community_audited',
          baseConfidence: 80,
          effectiveConfidence: 80,
          stalenessTier: 'FRESH',
          ageInDays: 25,
          physicalAttributes: {
            rampSlopeRatio: 0.125, // 1:8 steep slope
            doorWidthMm: 1000,
          },
        },
        {
          id: 'ap-main-gate',
          coordinates: { lat: 12.8718, lng: 80.2198 },
          type: 'wheelchair_entrance',
          source: 'field_verified',
          baseConfidence: 98,
          effectiveConfidence: 98,
          stalenessTier: 'FRESH',
          ageInDays: 13,
          physicalAttributes: {
            rampSlopeRatio: 0.0833, // 1:12 compliant slope
            doorWidthMm: 1500,
            doorMechanism: 'automatic_sensor',
          },
        },
      ],
    };

    const decision = evaluateAccessDecision(campusWithTwoEntrances, {
      maxRampSlopeRatio: 0.0833, // Max 1:12 policy
      minDoorWidthMm: 900,
    });

    expect(decision.selectedAccessPointId).toBe('ap-main-gate');
    expect(decision.destination.lat).toBe(12.8718);

    // Assert rejections audit trail contains Gate 2
    expect(decision.rejections.length).toBe(1);
    expect(decision.rejections[0].accessPointId).toBe('ap-gate-2');
    expect(decision.rejections[0].reason).toBe('RAMP_SLOPE_EXCEEDS_POLICY');
  });

  // 3. Temporal Confidence Decay
  it('Temporal Decay: calculates graceful confidence decay without erasing field-verified provenance', () => {
    // Fresh: 15 days
    const fresh = TemporalService.calculateEffectiveConfidence(98, 'field_verified', 15);
    expect(fresh.stalenessTier).toBe('FRESH');
    expect(fresh.effectiveConfidence).toBe(98);

    // Aging: 200 days (6-12 months) -> 0.9x
    const aging = TemporalService.calculateEffectiveConfidence(98, 'field_verified', 200);
    expect(aging.stalenessTier).toBe('AGING');
    expect(aging.effectiveConfidence).toBe(88.2);

    // Stale: 400 days (1-2 years) -> 0.75x
    const stale = TemporalService.calculateEffectiveConfidence(98, 'field_verified', 400);
    expect(stale.stalenessTier).toBe('STALE');
    expect(stale.effectiveConfidence).toBe(73.5);

    // Expired: 800 days (>2 years) -> 0.5x
    const expired = TemporalService.calculateEffectiveConfidence(98, 'field_verified', 800);
    expect(expired.stalenessTier).toBe('EXPIRED');
    expect(expired.effectiveConfidence).toBe(49);
    expect(expired.baseConfidence).toBe(98); // Provenance ceiling preserved!
  });

  // 4. Pedestrian Entrance Fallback
  it('Fallback: falls back to pedestrian entrance when no wheelchair entrance exists', () => {
    const pedestrianOnlyPlace: any = {
      placeId: 'loc-ped-only',
      name: 'Pedestrian Office',
      lat: 12.9500,
      lng: 80.2100,
      accessPoints: [
        {
          id: 'ap-ped-1',
          coordinates: { lat: 12.9505, lng: 80.2105 },
          type: 'pedestrian_entrance',
          source: 'community_audited',
          baseConfidence: 75,
          effectiveConfidence: 75,
          stalenessTier: 'FRESH',
          ageInDays: 30,
          physicalAttributes: { hasStepFreeAccess: true },
        },
      ],
    };

    const decision = evaluateAccessDecision(pedestrianOnlyPlace, { requireStepFree: true });
    expect(decision.selectedAccessPointId).toBe('ap-ped-1');
    expect(decision.selectionReason).toBe('pedestrian_entrance');
    expect(decision.destination.lat).toBe(12.9505);
  });

  // 5. Deterministic Tie-Breaking
  it('Deterministic Tie-Break: breaks ties between identical entrances deterministically by ID', () => {
    const twinGates: any = {
      placeId: 'loc-twins',
      name: 'Twin Gate Complex',
      lat: 12.9500,
      lng: 80.2100,
      accessPoints: [
        {
          id: 'ap-gate-b',
          coordinates: { lat: 12.9508, lng: 80.2108 },
          type: 'wheelchair_entrance',
          source: 'field_verified',
          baseConfidence: 98,
          effectiveConfidence: 98,
          stalenessTier: 'FRESH',
          ageInDays: 10,
        },
        {
          id: 'ap-gate-a',
          coordinates: { lat: 12.9502, lng: 80.2102 },
          type: 'wheelchair_entrance',
          source: 'field_verified',
          baseConfidence: 98,
          effectiveConfidence: 98,
          stalenessTier: 'FRESH',
          ageInDays: 10,
        },
      ],
    };

    const decision = evaluateAccessDecision(twinGates);
    // 'ap-gate-a' comes before 'ap-gate-b' alphabetically
    expect(decision.selectedAccessPointId).toBe('ap-gate-a');
  });
});
