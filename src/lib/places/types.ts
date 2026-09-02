/**
 * Domain Types for Places, Geocoding, Accessibility Policy, and Access Decisions
 */

export type LocationAccuracy =
  | 'entrance'
  | 'rooftop'
  | 'building'
  | 'parcel'
  | 'street'
  | 'locality'
  | 'region'
  | 'approximate';

export type AccessPointType =
  | 'pedestrian_entrance'
  | 'wheelchair_entrance'
  | 'vehicle_entrance'
  | 'main_entrance'
  | 'unknown';

export type VerificationStatus =
  | 'field_verified'     // Audited on-site (Base confidence ceiling: 98)
  | 'provider_verified'  // Official transit/places authority (Base confidence ceiling: 88)
  | 'community_audited'  // Submitted by verified disabled community member (Base confidence ceiling: 82)
  | 'inferred'           // Interpolated algorithmically (Base confidence ceiling: 65)
  | 'unverified';        // Fallback default (Base confidence ceiling: 30)

export type StalenessTier = 'FRESH' | 'AGING' | 'STALE' | 'EXPIRED';

export const CONFIDENCE_CEILINGS: Record<VerificationStatus, number> = {
  field_verified: 98,
  provider_verified: 88,
  community_audited: 82,
  inferred: 65,
  unverified: 30,
};

export const TEMPORAL_DECAY_FACTORS: Record<StalenessTier, number> = {
  FRESH: 1.0,     // < 180 days (6 months)
  AGING: 0.9,     // 180 - 365 days (6 - 12 months)
  STALE: 0.75,    // 365 - 730 days (1 - 2 years)
  EXPIRED: 0.5,   // > 730 days (> 2 years)
};

export interface PhysicalEntranceAttributes {
  rampSlopeRatio?: number; // Decimal: 1/12 = 0.0833, 1/8 = 0.125
  doorWidthMm?: number;    // Millimeters: e.g. 1200
  doorMechanism?: 'automatic_sensor' | 'push_button' | 'manual_swing' | 'revolving';
  hasTactilePaving?: boolean;
  hasStepFreeAccess?: boolean;
  stepCount?: number;
}

export interface AccessPoint {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: AccessPointType;
  source: VerificationStatus;
  baseConfidence: number;
  effectiveConfidence: number;
  stalenessTier: StalenessTier;
  ageInDays: number;
  isPrimaryWheelchairEntrance: boolean;
  physicalAttributes?: PhysicalEntranceAttributes;
  verifiedAt?: string;
  verifiedBy?: string;
  lastUpdatedAt?: string;
  evidenceSummary?: string;
}

export interface AccessibilityConstraints {
  maxRampSlopeRatio?: number; // e.g. 0.0833 (1:12) or 0.10 (1:10)
  minDoorWidthMm?: number;    // e.g. 900 or 1200
  allowManualDoor?: boolean;
  requireStepFree?: boolean;
}

export interface EntranceRejection {
  accessPointId: string;
  reason:
    | 'RAMP_SLOPE_EXCEEDS_POLICY'
    | 'DOOR_WIDTH_TOO_NARROW'
    | 'INACCESSIBLE_STEPS'
    | 'EXPIRED_WITHOUT_FALLBACK'
    | 'INVALID_COORDINATES';
  details: string;
}

export interface AccessDecision {
  placeId: string;
  canonicalPlaceId: string;
  selectedAccessPointId?: string;
  destination: {
    lat: number;
    lng: number;
  };
  selectionReason:
    | 'wheelchair_entrance'
    | 'pedestrian_entrance'
    | 'building_centroid';
  verificationStatus: VerificationStatus;
  stalenessTier: StalenessTier;
  baseConfidence: number;
  effectiveConfidence: number;
  ageInDays: number;
  rejections: EntranceRejection[];
  warnings: string[];
  auditTrail: string;
}

export type PlaceProviderType = 'google' | 'nominatim' | 'photon' | 'local' | 'hybrid';

export interface CanonicalAddress {
  street?: string;
  houseNumber?: string;
  neighborhood?: string;
  suburb?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  formattedAddress: string;
}

export interface AccessibilityMetadata {
  isStepFree?: boolean;
  hasWheelchairRamp?: boolean;
  rampSlopeRatio?: string; // e.g. "1:12"
  hasElevator?: boolean;
  tactilePaving?: boolean;
  doorWidthCm?: number;
  verifiedBy?: 'sugamya_bharat' | 'cpwd_audit' | 'community' | 'unverified';
}

export interface CanonicalPlace {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  locationAccuracy: LocationAccuracy;
  accessPoints?: AccessPoint[];
  selectedAccessPoint?: AccessPoint;
  verificationStatus: VerificationStatus;
  confidence: number;
  address: CanonicalAddress;
  distanceKm?: number;
  type?: string;
  source: {
    provider: PlaceProviderType;
    providerPlaceId?: string;
    retrievedAt: string;
  };
  accessibility?: AccessibilityMetadata;
}

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
  provider: PlaceProviderType;
  verificationStatus?: VerificationStatus;
  confidence?: number;
  hasVerifiedWheelchairEntrance?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
}

export interface PlaceSearchOptions {
  proximityCoordinates?: {
    lat: number;
    lng: number;
  };
  radiusMeters?: number;
  countryCodes?: string[];
  limit?: number;
  sessionToken?: string;
}

export interface CachePolicy {
  provider: PlaceProviderType;
  maxTtlSeconds: number;
  persist: boolean;
}

export interface IPlaceSearchProvider {
  readonly providerName: PlaceProviderType;
  autocomplete(query: string, options?: PlaceSearchOptions): Promise<PlaceSuggestion[]>;
  getPlaceDetails(placeId: string): Promise<CanonicalPlace | null>;
  search(query: string, options?: PlaceSearchOptions): Promise<CanonicalPlace[]>;
}
