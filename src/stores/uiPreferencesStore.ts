import { create } from 'zustand';

interface UiPreferencesState {
  isHighContrast: boolean;
  textSizeLevel: 'normal' | 'large' | 'xlarge';
  isReducedMotion: boolean;
  currentLanguageCode: string;

  toggleHighContrast: () => void;
  setTextSizeLevel: (level: 'normal' | 'large' | 'xlarge') => void;
  toggleReducedMotion: () => void;
  setLanguageCode: (code: string) => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>((set) => ({
  isHighContrast: false,
  textSizeLevel: 'normal',
  isReducedMotion: false,
  currentLanguageCode: 'en-US',

  toggleHighContrast: () => set((state) => ({ isHighContrast: !state.isHighContrast })),
  setTextSizeLevel: (level) => set({ textSizeLevel: level }),
  toggleReducedMotion: () => set((state) => ({ isReducedMotion: !state.isReducedMotion })),
  setLanguageCode: (code) => set({ currentLanguageCode: code }),
}));

