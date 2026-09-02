export type Role = 'TRAVELER' | 'OPERATOR' | 'AUDITOR' | 'GOVERNMENT' | 'ADMIN';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'OPERATOR_VERIFIED'
  | 'AUDITOR_VERIFIED'
  | 'COMMUNITY_CONFIRMED'
  | 'NEEDS_REVIEW';

export type OperationalStatus =
  | 'OPERATIONAL'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'CLOSED'
  | 'UNKNOWN';

export type KnowledgeStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'UNKNOWN'
  | 'CONFLICTING';

export type JourneyFeasibility = 'FEASIBLE' | 'NOT_FEASIBLE' | 'UNKNOWN';

export type NodeType =
  | 'HOME'
  | 'STATION'
  | 'AIRPORT'
  | 'HOTEL'
  | 'STADIUM'
  | 'ATTRACTION'
  | 'RESTAURANT'
  | 'ENTRANCE'
  | 'GATE'
  | 'TOILET'
  | 'SEATING'
  | 'PARKING'
  | 'TRAINING_FACILITY';

export type EdgeType =
  | 'WALKING'
  | 'ROAD_TAXI'
  | 'BUS'
  | 'METRO'
  | 'TRAIN'
  | 'SHUTTLE'
  | 'RAMP'
  | 'ELEVATOR'
  | 'CORRIDOR'
  | 'TRANSFER';

export interface AccessibilityProfile {
  id: string;
  userId: string;
  title: string;
  isDefault: boolean;
  requiresStepFree: boolean;
  requiresAccessibleVehicle: boolean;
  requiresAccessibleToilet: boolean;
  requiresWheelchairSeating: boolean;
  requiresElevator: boolean;
  requiresLowNoise: boolean;
  requiresVisualInfo: boolean;
  requiresAudioInfo: boolean;
  maxSlopePercent: number;
  maxWalkingDistanceMeters: number;
  wheelchairWidthCm?: number;
}

export interface AccessibilityNode {
  id: string;
  name: string;
  type: NodeType;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  stepFreeAccess: boolean;
  hasAccessibleToilet: boolean;
  hasElevator: boolean;
  hasWheelchairSeating: boolean;
  verificationStatus: VerificationStatus;
  knowledgeStatus: KnowledgeStatus;
  confidenceScore: number; // 0 - 100
  lastVerifiedAt: string;
}

export interface AccessibilityEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  distanceMeters: number;
  durationSeconds: number;
  isStepFree: boolean;
  slopePercent: number;
  vehicleAccessible: boolean;
  operationalStatus: OperationalStatus;
  confidenceScore: number; // 0 - 100
  lastVerifiedAt: string;
}

export interface LiveCondition {
  id: string;
  targetType: 'NODE' | 'EDGE';
  targetId: string;
  title: string;
  description: string;
  status: OperationalStatus;
  reportedAt: string;
  expiresAt?: string;
  source: 'OPERATOR' | 'COMMUNITY' | 'SYSTEM';
  alternativeId?: string;
}

export interface ConstraintViolation {
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  segmentId?: string;
  sourceNodeName?: string;
  targetNodeName?: string;
  requirementName: string;
}

export interface ConstraintWarning {
  code: string;
  reason: string;
  segmentId?: string;
}

export interface ConstraintEvaluation {
  feasible: boolean;
  feasibilityState: JourneyFeasibility;
  violations: ConstraintViolation[];
  warnings: ConstraintWarning[];
  confidence: number;
}

export interface SubScores {
  mobility: number;
  transport: number;
  accommodation: number;
  venue: number;
  toiletAccess: number;
  navigation: number;
  sensory: number;
  emergency: number;
}

export interface JourneyIntelligence {
  feasibility: JourneyFeasibility;
  qualityScore: number;      // 0 - 100
  resilienceScore: number;   // 0 - 100
  confidenceScore: number;   // 0 - 100
  criticalDependenciesCount: number;
  subScores: SubScores;
  violations: ConstraintViolation[];
  warnings: ConstraintWarning[];
  explanations: string[];
}

export interface JourneySegment {
  id: string;
  sourceNode: AccessibilityNode;
  targetNode: AccessibilityNode;
  edge: AccessibilityEdge;
  evaluation: ConstraintEvaluation;
  liveCondition?: LiveCondition;
}

export interface CalculatedJourney {
  id: string;
  originName: string;
  destinationName: string;
  profile: AccessibilityProfile;
  segments: JourneySegment[];
  intelligence: JourneyIntelligence;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  createdAt: string;
}

export type SihDemoState =
  | 'INITIAL'
  | 'FAILED'
  | 'FIXING'
  | 'FIXED'
  | 'OUTAGE'
  | 'REROUTING'
  | 'RESTORED';

export interface WizardUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authMethod: 'google' | 'email' | 'guest';
}

export interface DisabilityCategory {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  subOptions?: DisabilitySubOption[];
}

export interface DisabilitySubOption {
  id: string;
  label: string;
  selected: boolean;
  value?: number;
}

export interface GooglePlaceLocation {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface TransportOption {
  id: string;
  name: string;
  operator: string;
  type: EdgeType;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  accessibilityStatus: 'accessible' | 'limited' | 'inaccessible' | 'unknown';
  wheelchairSupport: boolean;
  boardingMethod: string;
  accessibilityNotes: string;
  externalBookingUrl?: string;
  selected: boolean;
}

export interface ExternalBookingProvider {
  name: string;
  logoUrl?: string;
  bookingBaseUrl: string;
  isExternal: boolean;
}

export interface SavedJourney {
  id: string;
  userId: string;
  journey: CalculatedJourney;
  savedAt: string;
  originLocation?: GooglePlaceLocation;
  destinationLocation?: GooglePlaceLocation;
  peopleCount: number;
  disabledCount: number;
  disabilityCategories: string[];
  wheelchairWidthCm: number;
}
