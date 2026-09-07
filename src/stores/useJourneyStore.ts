import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore } from './useAppStore';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

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

export type OutageCategory = 'Elevator' | 'Ramp' | 'Tactile Path' | 'Boarding Area' | 'Signage' | 'Other';

export interface Outage {
  id: string;
  infrastructure: string;
  location: string;
  status: 'Outage' | 'Operational' | 'Unknown';
  reportedBy: string;
  reporterUserId?: string;
  reportedAt: string;
  verifiedAt?: string;
  confidence: 'High' | 'Medium' | 'Low';
  affectedSegments: string[];
  coordinates?: { lat: number; lng: number };
  category?: OutageCategory;
  // Crowd verification — populated only by real user actions
  votes?: { up: number; down: number };
  voters?: string[]; // userIds who already voted (prevents duplicates)
  crowdConfidence?: number; // 0–100 derived from votes
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
  simulateOutage: (segmentId: string) => void;
  verifySegmentAccessibility: (segmentId: string, worked: boolean, note?: string) => void;
  voteOutage: (outageId: string, vote: 'up' | 'down', userId: string) => void;

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
      outages: [],

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
        await new Promise((r) => setTimeout(r, 1000));
        const { outages, savedJourneys } = get();
        const journey = savedJourneys.find((j) => j.id === id);
        if (!journey) return;

        const matchingOutages = outages.filter((o) => {
          if (o.status !== 'Outage') return false;
          if (o.affectedSegments?.some((segId) => journey.segments.some((s) => s.id === segId))) return true;

          if (o.coordinates) {
            const { lat, lng } = o.coordinates;
            if (journey.origin?.lat && journey.origin?.lng && haversineDistance(journey.origin.lat, journey.origin.lng, lat, lng) <= 600) return true;
            if (journey.destination?.lat && journey.destination?.lng && haversineDistance(journey.destination.lat, journey.destination.lng, lat, lng) <= 600) return true;
            for (const s of journey.segments) {
              if (s.startCoordinates && haversineDistance(s.startCoordinates.lat, s.startCoordinates.lng, lat, lng) <= 600) return true;
              if (s.endCoordinates && haversineDistance(s.endCoordinates.lat, s.endCoordinates.lng, lat, lng) <= 600) return true;
              if (s.coordinates) {
                for (const c of s.coordinates) {
                  if (haversineDistance(c[0], c[1], lat, lng) <= 600) return true;
                }
              }
            }
          }

          const oLoc = o.location.toLowerCase();
          return journey.segments.some((s) => `${s.label} ${s.from} ${s.to}`.toLowerCase().includes(oLoc));
        });

        const isFeasible = matchingOutages.length === 0;
        const warnings = matchingOutages.map(
          (o) => `${o.infrastructure} at ${o.location} is currently out of service. Accessible detour recommended.`
        );

        set((s) => ({
          savedJourneys: s.savedJourneys.map((j) =>
            j.id === id
              ? {
                  ...j,
                  recheckResult: {
                    feasible: isFeasible,
                    accessibilityQuality: isFeasible ? 94 : Math.max(50, 94 - matchingOutages.length * 20),
                    warnings,
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

      addOutage: (o) => {
        const fullOutage: Outage = {
          ...o,
          votes: o.votes || { up: 0, down: 0 },
          voters: o.voters || [],
          crowdConfidence: o.crowdConfidence ?? 0,
        };

        const { currentJourney, savedJourneys } = get();

        // Check if any journey is affected by this outage
        const checkJourneyAffected = (j: Journey) => {
          if (!fullOutage.coordinates) {
            const loc = fullOutage.location.toLowerCase();
            return j.segments.some((s) => `${s.label} ${s.from} ${s.to}`.toLowerCase().includes(loc));
          }
          const { lat, lng } = fullOutage.coordinates;
          if (j.origin?.lat && j.origin?.lng && haversineDistance(j.origin.lat, j.origin.lng, lat, lng) <= 600) return true;
          if (j.destination?.lat && j.destination?.lng && haversineDistance(j.destination.lat, j.destination.lng, lat, lng) <= 600) return true;
          return j.segments.some((s) => {
            if (s.startCoordinates && haversineDistance(s.startCoordinates.lat, s.startCoordinates.lng, lat, lng) <= 600) return true;
            if (s.endCoordinates && haversineDistance(s.endCoordinates.lat, s.endCoordinates.lng, lat, lng) <= 600) return true;
            if (s.coordinates) {
              return s.coordinates.some((c) => haversineDistance(c[0], c[1], lat, lng) <= 600);
            }
            return false;
          });
        };

        const affectedJourneys: string[] = [];
        if (currentJourney && checkJourneyAffected(currentJourney)) {
          affectedJourneys.push(currentJourney.destination?.name || 'Active Route');
        }
        savedJourneys.forEach((sj) => {
          if (checkJourneyAffected(sj)) {
            affectedJourneys.push(sj.name || sj.destination?.name || 'Saved Route');
          }
        });

        if (affectedJourneys.length > 0) {
          useAppStore.getState().addNotification({
            type: 'outage',
            title: `Outage alert on ${affectedJourneys[0]}`,
            message: `${fullOutage.infrastructure} at ${fullOutage.location} was reported out of service. Your route may be affected.`,
            actionUrl: '/outages',
          });
        }

        set((s) => ({
          outages: [fullOutage, ...s.outages],
        }));
      },

      voteOutage: (outageId, vote, userId) => {
        set((s) => ({
          outages: s.outages.map((o) => {
            if (o.id !== outageId) return o;
            const voters = o.voters || [];
            if (voters.includes(userId)) return o; // already voted

            const currentVotes = o.votes || { up: 0, down: 0 };
            const newVotes = {
              up: vote === 'up' ? currentVotes.up + 1 : currentVotes.up,
              down: vote === 'down' ? currentVotes.down + 1 : currentVotes.down,
            };
            const total = newVotes.up + newVotes.down;
            // crowdConfidence = upvote ratio * log-scaled weight (max 100)
            const ratio = total > 0 ? newVotes.up / total : 0;
            const weight = Math.min(1, Math.log10(total + 1) / Math.log10(21)); // saturates at 20 votes
            const crowdConfidence = Math.round(ratio * weight * 100);

            // Escalate or de-escalate confidence tier based on crowd score
            let confidence = o.confidence;
            if (crowdConfidence >= 70) confidence = 'High';
            else if (crowdConfidence >= 40) confidence = 'Medium';
            else if (total >= 3 && crowdConfidence < 30) confidence = 'Low';

            return {
              ...o,
              votes: newVotes,
              voters: [...voters, userId],
              crowdConfidence,
              confidence,
              verifiedAt: crowdConfidence >= 70 ? new Date().toISOString() : o.verifiedAt,
            };
          }),
        }));
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
