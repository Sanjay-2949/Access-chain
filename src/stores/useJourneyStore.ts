import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccessibilityStatus = 'ACCESSIBLE' | 'INACCESSIBLE' | 'UNKNOWN';
export type DataSource = 'LIVE' | 'RECENTLY_VERIFIED' | 'USER_REPORTED' | 'DEMO' | 'UNKNOWN';

export interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface JourneySegment {
  id: string;
  type: 'walk' | 'metro' | 'bus' | 'train' | 'uber' | 'ramp' | 'elevator' | 'transfer';
  label: string;
  from: string;
  to: string;
  duration: number; // minutes
  distance?: number; // meters
  accessibility: AccessibilityStatus;
  warnings: string[];
  confidence: number; // 0-100
  width?: number; // cm for corridors
  steps?: number;
  elevatorAvailable?: boolean;
  rampAvailable?: boolean;
  wheelchairBoarding?: boolean;
  dataSource: DataSource;
  operator?: string;
  departure?: string;
  arrival?: string;
  fare?: number;
  coordinates?: [number, number][];
  startCoordinates?: { lat: number; lng: number };
  endCoordinates?: { lat: number; lng: number };
}

export interface Journey {
  id: string;
  origin: Place;
  destination: Place;
  segments: JourneySegment[];
  feasible: boolean;
  accessibilityQuality: number;
  resilience: number;
  warnings: string[];
  alternatives: AlternativeRoute[];
  createdAt: string;
  savedAt?: string;
  name?: string;
  spof?: string; // segment id that is a single point of failure
  totalDuration: number;
  totalDistance: number;
}

export interface AlternativeRoute {
  id: string;
  description: string;
  segments: JourneySegment[];
  feasible: boolean;
  accessibilityQuality: number;
  resilience: number;
}

export interface SavedJourney extends Journey {
  savedAt: string;
  recheckResult?: {
    feasible: boolean;
    accessibilityQuality: number;
    warnings: string[];
    checkedAt: string;
  };
}

export type OutageCategory = 'ELEVATOR' | 'RAMP' | 'TACTILE_PATH' | 'HYDRAULIC_LIFT' | 'PLATFORM_GAP' | 'GENERAL';

export interface Outage {
  id: string;
  infrastructure: string;
  location: string;
  status: 'Outage' | 'Operational' | 'Unknown';
  reportedBy: string;
  reportedAt: string;
  verifiedAt?: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore?: number; // 0 - 100%
  upvotes?: number; // confirm outage
  downvotes?: number; // report fixed
  voters?: Record<string, 'CONFIRM_OUTAGE' | 'REPORT_FIXED'>;
  category?: OutageCategory;
  verifiedByCrowd?: boolean;
  affectedSegments: string[];
  coordinates?: { lat: number; lng: number };
  evidencePhotoUrl?: string;
}

export interface InTransitAlert {
  id: string;
  outageId: string;
  infrastructure: string;
  affectedSegmentId: string;
  distanceMeters: number;
  message: string;
  suggestedAlternative: {
    segment: JourneySegment;
    impactDescription: string;
  };
}

export interface ActiveNavigationState {
  isNavigating: boolean;
  currentSegmentIndex: number;
  userLocation: { lat: number; lng: number; accuracy?: number; heading?: number } | null;
  activeAlert: InTransitAlert | null;
  hasAudioAlerted: boolean;
  isSimulated: boolean;
}

interface JourneyWizard {
  step: number;
  totalPeople: number;
  accessibilityCount: number;
  accessibilityTypes: string[];
  mobilityConfig: {
    wheelchair: boolean;
    wheelchairWidth: number;
    walkingAid: boolean;
    limitedWalking: boolean;
    maxWalkingDistance: number;
  };
  origin: Place | null;
  destination: Place | null;
  journeyType: 'fastTravel' | 'tourism' | 'community' | 'help' | null;
  tourismDate?: string;
}

interface JourneyState {
  wizard: JourneyWizard;
  currentJourney: Journey | null;
  savedJourneys: SavedJourney[];
  outages: Outage[];
  isRouting: boolean;
  isFindingAlternative: boolean;
  activeNavigation: ActiveNavigationState;

  setWizardStep: (step: number) => void;
  updateWizard: (data: Partial<JourneyWizard>) => void;
  resetWizard: () => void;
  setCurrentJourney: (j: Journey | null) => void;
  saveCurrentJourney: () => void;
  deleteJourney: (id: string) => void;
  recheckJourney: (id: string) => Promise<void>;
  setRouting: (v: boolean) => void;
  findAlternative: (spofSegmentId: string) => Promise<void>;
  addOutage: (o: Outage) => void;
  voteOutage: (outageId: string, voteType: 'CONFIRM_OUTAGE' | 'REPORT_FIXED', userId?: string) => void;
  simulateOutage: (segmentId: string) => void;
  verifySegmentAccessibility: (segmentId: string, worked: boolean, note?: string) => void;

  // Active in-transit navigation methods
  startNavigation: (initialLoc?: { lat: number; lng: number }) => void;
  stopNavigation: () => void;
  advanceNavigationStep: () => void;
  setNavigationStep: (index: number) => void;
  updateUserLocation: (loc: { lat: number; lng: number; accuracy?: number; heading?: number }, isSimulated?: boolean) => void;
  setActiveAlert: (alert: InTransitAlert | null) => void;
  acceptInTransitReroute: () => void;
}

const defaultWizard: JourneyWizard = {
  step: 1,
  totalPeople: 1,
  accessibilityCount: 1,
  accessibilityTypes: [],
  mobilityConfig: { wheelchair: true, wheelchairWidth: 70, walkingAid: false, limitedWalking: true, maxWalkingDistance: 400 },
  origin: null,
  destination: null,
  journeyType: null,
};

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      wizard: defaultWizard,
      currentJourney: null,
      savedJourneys: [],
      isRouting: false,
      isFindingAlternative: false,
      activeNavigation: {
        isNavigating: false,
        currentSegmentIndex: 0,
        userLocation: null,
        activeAlert: null,
        hasAudioAlerted: false,
        isSimulated: false,
      },
      outages: [
        {
          id: 'outage-1',
          infrastructure: 'Gate 4 Elevator',
          location: 'Chennai Central Station',
          status: 'Outage',
          reportedBy: 'Station Staff',
          reportedAt: new Date(Date.now() - 7200000).toISOString(),
          confidence: 'High',
          confidenceScore: 88,
          upvotes: 7,
          downvotes: 1,
          category: 'ELEVATOR',
          verifiedByCrowd: true,
          affectedSegments: ['seg-elevator-gate4'],
          coordinates: { lat: 13.0827, lng: 80.2707 },
        },
        {
          id: 'outage-2',
          infrastructure: 'Platform 2 to Concourse Ramp',
          location: 'Guindy Metro Station',
          status: 'Outage',
          reportedBy: 'Divyangjan Traveler Priya R.',
          reportedAt: new Date(Date.now() - 14400000).toISOString(),
          confidence: 'Medium',
          confidenceScore: 68,
          upvotes: 4,
          downvotes: 1,
          category: 'RAMP',
          verifiedByCrowd: true,
          affectedSegments: ['seg-guindy-ramp2'],
          coordinates: { lat: 13.0067, lng: 80.2025 },
        },
        {
          id: 'outage-3',
          infrastructure: 'Continuous TGSI Tactile Guideway',
          location: 'Velachery Terminus Bay 3',
          status: 'Operational',
          reportedBy: 'Crowd Verified (Fixed)',
          reportedAt: new Date(Date.now() - 28800000).toISOString(),
          verifiedAt: new Date(Date.now() - 3600000).toISOString(),
          confidence: 'High',
          confidenceScore: 20,
          upvotes: 1,
          downvotes: 8,
          category: 'TACTILE_PATH',
          verifiedByCrowd: true,
          affectedSegments: [],
          coordinates: { lat: 12.9782, lng: 80.2212 },
        },
      ],

      setWizardStep: (step) => set((s) => ({ wizard: { ...s.wizard, step } })),
      updateWizard: (data) => set((s) => ({ wizard: { ...s.wizard, ...data } })),
      resetWizard: () => set({ wizard: defaultWizard }),

      setCurrentJourney: (j) => set({ currentJourney: j }),

      saveCurrentJourney: () => {
        const { currentJourney, savedJourneys } = get();
        if (!currentJourney) return;
        const saved: SavedJourney = { ...currentJourney, savedAt: new Date().toISOString() };
        const existing = savedJourneys.findIndex((s) => s.id === saved.id);
        if (existing >= 0) {
          const updated = [...savedJourneys];
          updated[existing] = saved;
          set({ savedJourneys: updated });
        } else {
          set({ savedJourneys: [saved, ...savedJourneys] });
        }
      },

      deleteJourney: (id) =>
        set((s) => ({ savedJourneys: s.savedJourneys.filter((j) => j.id !== id) })),

      recheckJourney: async (id) => {
        await new Promise((r) => setTimeout(r, 1500));
        const { outages } = get();
        const hasOutage = outages.some((o) => o.status === 'Outage');
        set((s) => ({
          savedJourneys: s.savedJourneys.map((j) =>
            j.id === id
              ? {
                  ...j,
                  recheckResult: {
                    feasible: !hasOutage,
                    accessibilityQuality: hasOutage ? 62 : 94,
                    warnings: hasOutage ? ['Gate 4 elevator currently out of service. Alternative route available via Gate 5 ramp.'] : [],
                    checkedAt: new Date().toISOString(),
                  },
                }
              : j
          ),
        }));
      },

      setRouting: (v) => set({ isRouting: v }),

      findAlternative: async (spofSegmentId) => {
        set({ isFindingAlternative: true });
        await new Promise((r) => setTimeout(r, 2500));
        const { currentJourney } = get();
        if (!currentJourney) { set({ isFindingAlternative: false }); return; }

        const updatedSegments = currentJourney.segments.map((seg) => {
          if (seg.id === spofSegmentId) {
            return {
              ...seg,
              id: 'seg-ramp-gate5',
              label: 'Gate 5 Ramp',
              type: 'ramp' as const,
              accessibility: 'ACCESSIBLE' as const,
              warnings: [],
              confidence: 88,
              rampAvailable: true,
              dataSource: 'RECENTLY_VERIFIED' as const,
            };
          }
          return seg;
        });

        set({
          isFindingAlternative: false,
          currentJourney: {
            ...currentJourney,
            segments: updatedSegments,
            feasible: true,
            accessibilityQuality: 87,
            resilience: 79,
            warnings: ['Route updated: Gate 4 elevator replaced with Gate 5 ramp.'],
            spof: undefined,
          },
        });
      },

      addOutage: (o) =>
        set((s) => ({
          outages: [
            {
              ...o,
              confidenceScore: o.confidenceScore ?? 70,
              upvotes: o.upvotes ?? 1,
              downvotes: o.downvotes ?? 0,
              voters: o.voters ?? { 'user-me': 'CONFIRM_OUTAGE' },
              verifiedByCrowd: o.verifiedByCrowd ?? true,
            },
            ...s.outages,
          ],
        })),

      voteOutage: (outageId, voteType, userId = 'user-me') => {
        set((s) => {
          const updatedOutages = s.outages.map((outage) => {
            if (outage.id !== outageId) return outage;

            const currentVoters = { ...(outage.voters || {}) };
            const previousVote = currentVoters[userId];

            let newUpvotes = outage.upvotes || 0;
            let newDownvotes = outage.downvotes || 0;

            if (previousVote === voteType) {
              return outage;
            }

            if (previousVote === 'CONFIRM_OUTAGE') {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else if (previousVote === 'REPORT_FIXED') {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }

            if (voteType === 'CONFIRM_OUTAGE') {
              newUpvotes += 1;
            } else {
              newDownvotes += 1;
            }

            currentVoters[userId] = voteType;

            // Bayesian consensus confidence calculation with Laplace smoothing
            const calculatedScore = Math.round(
              ((newUpvotes + 1) / (newUpvotes + newDownvotes + 2)) * 100
            );

            let newStatus: Outage['status'] = outage.status;
            let newConfidence: Outage['confidence'] = 'Medium';
            let verifiedAt = outage.verifiedAt;

            if (calculatedScore >= 65) {
              newConfidence = 'High';
              newStatus = 'Outage';
            } else if (calculatedScore >= 45) {
              newConfidence = 'Medium';
              newStatus = 'Outage';
            } else {
              // Below 45%: Crowd consensus confirms equipment is restored and working
              newConfidence = 'High';
              newStatus = 'Operational';
              verifiedAt = new Date().toISOString();
            }

            return {
              ...outage,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              confidenceScore: calculatedScore,
              confidence: newConfidence,
              status: newStatus,
              verifiedAt,
              verifiedByCrowd: true,
              voters: currentVoters,
            };
          });

          return { outages: updatedOutages };
        });
      },

      simulateOutage: (segmentId) => {
        set((s) => ({
          outages: s.outages.map((o, i) =>
            i === 0
              ? {
                  ...o,
                  affectedSegments: Array.from(new Set([...(o.affectedSegments || []), segmentId])),
                  status: 'Outage',
                }
              : o
          ),
          currentJourney: s.currentJourney
            ? {
                ...s.currentJourney,
                feasible: false,
                warnings: [...(s.currentJourney.warnings || []), 'Gate 4 elevator is currently out of service. Single Point of Failure detected.'],
                spof: segmentId,
              }
            : null,
        }));
      },

      verifySegmentAccessibility: (segmentId, worked, note) => {
        set((s) => {
          if (!s.currentJourney) return s;
          const updatedSegments = s.currentJourney.segments.map((seg) => {
            if (seg.id === segmentId) {
              return {
                ...seg,
                accessibility: worked ? 'ACCESSIBLE' as const : 'INACCESSIBLE' as const,
                dataSource: 'USER_REPORTED' as const,
                warnings: note ? [...(seg.warnings || []), `User Note: ${note}`] : seg.warnings,
              };
            }
            return seg;
          });
          return {
            currentJourney: {
              ...s.currentJourney,
              segments: updatedSegments,
            },
          };
        });
      },

      startNavigation: (initialLoc) => {
        const { currentJourney } = get();
        const startPos = initialLoc || (currentJourney?.origin ? { lat: currentJourney.origin.lat, lng: currentJourney.origin.lng } : null);
        set((s) => ({
          activeNavigation: {
            isNavigating: true,
            currentSegmentIndex: 0,
            userLocation: startPos,
            activeAlert: null,
            hasAudioAlerted: false,
            isSimulated: false,
          },
        }));
      },

      stopNavigation: () => {
        set((s) => ({
          activeNavigation: {
            ...s.activeNavigation,
            isNavigating: false,
            activeAlert: null,
            hasAudioAlerted: false,
          },
        }));
      },

      advanceNavigationStep: () => {
        set((s) => ({
          activeNavigation: {
            ...s.activeNavigation,
            currentSegmentIndex: Math.min(
              (s.currentJourney?.segments.length || 1) - 1,
              s.activeNavigation.currentSegmentIndex + 1
            ),
            activeAlert: null,
            hasAudioAlerted: false,
          },
        }));
      },

      setNavigationStep: (index: number) => {
        set((s) => ({
          activeNavigation: {
            ...s.activeNavigation,
            currentSegmentIndex: index,
            activeAlert: null,
            hasAudioAlerted: false,
          },
        }));
      },

      updateUserLocation: (loc, isSimulated = false) => {
        set((s) => ({
          activeNavigation: {
            ...s.activeNavigation,
            userLocation: loc,
            isSimulated,
          },
        }));
      },

      setActiveAlert: (alert) => {
        set((s) => ({
          activeNavigation: {
            ...s.activeNavigation,
            activeAlert: alert,
            hasAudioAlerted: alert ? s.activeNavigation.hasAudioAlerted : false,
          },
        }));
      },

      acceptInTransitReroute: () => {
        const { currentJourney, activeNavigation } = get();
        if (!currentJourney || !activeNavigation.activeAlert) return;

        const { affectedSegmentId, suggestedAlternative } = activeNavigation.activeAlert;
        const updatedSegments = currentJourney.segments.map((seg) => {
          if (seg.id === affectedSegmentId) {
            return suggestedAlternative.segment;
          }
          return seg;
        });

        set({
          currentJourney: {
            ...currentJourney,
            segments: updatedSegments,
            feasible: true,
            accessibilityQuality: Math.max(88, currentJourney.accessibilityQuality),
            warnings: [
              ...(currentJourney.warnings || []).filter((w) => !w.includes(affectedSegmentId)),
              `Rerouted: ${suggestedAlternative.segment.label} (${suggestedAlternative.impactDescription})`,
            ],
            spof: undefined,
          },
          activeNavigation: {
            ...activeNavigation,
            activeAlert: null,
            hasAudioAlerted: false,
          },
        });
      },
    }),
    { name: 'accesschain-journey', partialize: (s) => ({ savedJourneys: s.savedJourneys, outages: s.outages }) }
  )
);
