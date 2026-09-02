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

export interface Outage {
  id: string;
  infrastructure: string;
  location: string;
  status: 'Outage' | 'Operational' | 'Unknown';
  reportedBy: string;
  reportedAt: string;
  verifiedAt?: string;
  confidence: 'High' | 'Medium' | 'Low';
  affectedSegments: string[];
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
  simulateOutage: (segmentId: string) => void;
  verifySegmentAccessibility: (segmentId: string, worked: boolean, note?: string) => void;
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
      outages: [
        {
          id: 'outage-1',
          infrastructure: 'Gate 4 Elevator',
          location: 'Chennai Central Station',
          status: 'Outage',
          reportedBy: 'Station Staff',
          reportedAt: new Date(Date.now() - 7200000).toISOString(),
          confidence: 'High',
          affectedSegments: ['seg-elevator-gate4'],
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

      addOutage: (o) => set((s) => ({ outages: [o, ...s.outages] })),

      simulateOutage: (segmentId) => {
        set((s) => ({
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
    }),
    { name: 'accesschain-journey', partialize: (s) => ({ savedJourneys: s.savedJourneys, outages: s.outages }) }
  )
);
