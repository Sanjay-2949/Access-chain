import { create } from 'zustand';
import { WizardUser, GooglePlaceLocation, TransportOption, DisabilityCategory, SavedJourney } from '../types/accessibility';

type WizardScreen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface JourneyWizardState {
  // Navigation
  currentScreen: WizardScreen;
  
  // Auth (Screen 2)
  user: WizardUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  
  // Smart Journey (Screen 3)
  peopleCount: number;
  disabledCount: number;
  
  // Disability (Screen 4)
  disabilityCategories: DisabilityCategory[];
  wheelchairWidthCm: number;
  maxWalkingDistanceM: number;
  preferNotToSay: boolean;
  
  // Journey Type (Screen 5)
  journeyType: 'tourism' | 'fast-travel' | 'community' | 'help' | null;
  travelDate: string;
  
  // Locations (Screen 6 & 7)
  originLocation: GooglePlaceLocation | null;
  destinationLocation: GooglePlaceLocation | null;
  
  // Transport (Screen 9)
  transportOptions: TransportOption[];
  selectedTransportId: string | null;
  selectedTiming: string | null;
  
  // Failure Demo (Screen 11)
  failureTriggered: boolean;
  rerouteInProgress: boolean;
  rerouteComplete: boolean;
  
  // Save (Screen 12)
  journeySaved: boolean;
  savedJourneyId: string | null;

  // Actions
  setScreen: (screen: WizardScreen) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  
  setUser: (user: WizardUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  logout: () => void;
  
  setPeopleCount: (count: number) => void;
  setDisabledCount: (count: number) => void;
  
  toggleDisabilityCategory: (categoryId: string) => void;
  toggleSubOption: (categoryId: string, subOptionId: string) => void;
  setWheelchairWidth: (cm: number) => void;
  setMaxWalkingDistance: (m: number) => void;
  setPreferNotToSay: (value: boolean) => void;
  
  setJourneyType: (type: 'tourism' | 'fast-travel' | 'community' | 'help') => void;
  setTravelDate: (date: string) => void;
  
  setOriginLocation: (loc: GooglePlaceLocation | null) => void;
  setDestinationLocation: (loc: GooglePlaceLocation | null) => void;
  
  setTransportOptions: (options: TransportOption[]) => void;
  selectTransport: (id: string) => void;
  setSelectedTiming: (timing: string) => void;
  
  triggerFailure: () => void;
  startReroute: () => void;
  completeReroute: () => void;
  
  saveJourney: (journeyId: string) => void;
  
  resetWizard: () => void;
}

const DEFAULT_DISABILITY_CATEGORIES: DisabilityCategory[] = [
  { id: 'mobility', name: 'Mobility', icon: '♿', selected: false, subOptions: [
    { id: 'wheelchair', label: 'Wheelchair User', selected: false },
    { id: 'walking-aid', label: 'Walking Aid', selected: false },
    { id: 'limited-walking', label: 'Limited Walking Distance', selected: false },
  ]},
  { id: 'vision', name: 'Vision', icon: '👁️', selected: false, subOptions: [
    { id: 'low-vision', label: 'Low Vision', selected: false },
    { id: 'blind', label: 'Blind', selected: false },
    { id: 'color-blind', label: 'Color Blind', selected: false },
  ]},
  { id: 'cognitive', name: 'Cognitive', icon: '🧠', selected: false, subOptions: [
    { id: 'autism', label: 'Autism Spectrum', selected: false },
    { id: 'learning-disability', label: 'Learning Disability', selected: false },
    { id: 'memory', label: 'Memory Difficulties', selected: false },
  ]},
  { id: 'hearing', name: 'Hearing', icon: '👂', selected: false, subOptions: [
    { id: 'hard-of-hearing', label: 'Hard of Hearing', selected: false },
    { id: 'deaf', label: 'Deaf', selected: false },
  ]},
  { id: 'speech', name: 'Speech', icon: '💬', selected: false, subOptions: [
    { id: 'speech-impairment', label: 'Speech Impairment', selected: false },
    { id: 'non-verbal', label: 'Non-Verbal', selected: false },
  ]},
];

export const useJourneyWizardStore = create<JourneyWizardState>((set) => ({
  // Initial State
  currentScreen: 1,
  
  user: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
  
  peopleCount: 1,
  disabledCount: 0,
  
  disabilityCategories: DEFAULT_DISABILITY_CATEGORIES,
  wheelchairWidthCm: 70,
  maxWalkingDistanceM: 500,
  preferNotToSay: false,
  
  journeyType: null,
  travelDate: new Date().toISOString(),
  
  originLocation: null,
  destinationLocation: null,
  
  transportOptions: [],
  selectedTransportId: null,
  selectedTiming: null,
  
  failureTriggered: false,
  rerouteInProgress: false,
  rerouteComplete: false,
  
  journeySaved: false,
  savedJourneyId: null,

  // Actions
  setScreen: (screen) => set({ currentScreen: screen }),
  nextScreen: () => set((state) => ({ 
    currentScreen: Math.min(state.currentScreen + 1, 12) as WizardScreen 
  })),
  prevScreen: () => set((state) => ({ 
    currentScreen: Math.max(state.currentScreen - 1, 1) as WizardScreen 
  })),
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAuthError: (error) => set({ authError: error }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  setPeopleCount: (count) => set({ peopleCount: count }),
  setDisabledCount: (count) => set({ disabledCount: count }),
  
  toggleDisabilityCategory: (categoryId) => set((state) => ({
    disabilityCategories: state.disabilityCategories.map(cat => 
      cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
    )
  })),
  toggleSubOption: (categoryId, subOptionId) => set((state) => ({
    disabilityCategories: state.disabilityCategories.map(cat => 
      cat.id === categoryId && cat.subOptions ? {
        ...cat,
        subOptions: cat.subOptions.map(sub => 
          sub.id === subOptionId ? { ...sub, selected: !sub.selected } : sub
        )
      } : cat
    )
  })),
  setWheelchairWidth: (cm) => set({ wheelchairWidthCm: cm }),
  setMaxWalkingDistance: (m) => set({ maxWalkingDistanceM: m }),
  setPreferNotToSay: (value) => set({ preferNotToSay: value }),
  
  setJourneyType: (type) => set({ journeyType: type }),
  setTravelDate: (date) => set({ travelDate: date }),
  
  setOriginLocation: (loc) => set({ originLocation: loc }),
  setDestinationLocation: (loc) => set({ destinationLocation: loc }),
  
  setTransportOptions: (options) => set({ transportOptions: options }),
  selectTransport: (id) => set({ selectedTransportId: id }),
  setSelectedTiming: (timing) => set({ selectedTiming: timing }),
  
  triggerFailure: () => set({ failureTriggered: true }),
  startReroute: () => set({ rerouteInProgress: true, failureTriggered: false }),
  completeReroute: () => set({ rerouteInProgress: false, rerouteComplete: true }),
  
  saveJourney: (journeyId) => set({ journeySaved: true, savedJourneyId: journeyId }),
  
  resetWizard: () => set({
    currentScreen: 1,
    peopleCount: 1,
    disabledCount: 0,
    disabilityCategories: DEFAULT_DISABILITY_CATEGORIES,
    wheelchairWidthCm: 70,
    maxWalkingDistanceM: 500,
    preferNotToSay: false,
    journeyType: null,
    originLocation: null,
    destinationLocation: null,
    transportOptions: [],
    selectedTransportId: null,
    selectedTiming: null,
    failureTriggered: false,
    rerouteInProgress: false,
    rerouteComplete: false,
    journeySaved: false,
    savedJourneyId: null,
  }),
}));
