import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ta' | 'hi' | 'kn' | 'te';
export type TextSize = 'normal' | 'large' | 'xlarge';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  role: 'user' | 'volunteer' | 'ngo' | 'admin';
}

export interface AccessibilityProfile {
  mobility: {
    wheelchair: boolean;
    wheelchairWidth: number; // cm
    walkingAid: boolean;
    limitedWalking: boolean;
    maxWalkingDistance: number; // meters
  };
  vision: { visualAssistance: boolean; highContrast: boolean };
  hearing: { visualNotifications: boolean };
  cognitive: { simplifiedInstructions: boolean; fewerTransfers: boolean };
  speech: { textFirst: boolean };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface Notification {
  id: string;
  type: 'outage' | 'assistance' | 'journey' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  accessibilityProfile: AccessibilityProfile;
  emergencyContacts: EmergencyContact[];
  notifications: Notification[];
  language: Language;
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  notifPrefs: { outage: boolean; journey: boolean; community: boolean };

  login: (user: User) => void;
  logout: () => void;
  updateProfile: (profile: Partial<AccessibilityProfile>) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  setLanguage: (lang: Language) => void;
  setTextSize: (size: TextSize) => void;
  setHighContrast: (val: boolean) => void;
  setReducedMotion: (val: boolean) => void;
  setNotifPrefs: (prefs: Partial<AppState['notifPrefs']>) => void;
}

const defaultProfile: AccessibilityProfile = {
  mobility: { wheelchair: true, wheelchairWidth: 70, walkingAid: false, limitedWalking: true, maxWalkingDistance: 400 },
  vision: { visualAssistance: false, highContrast: false },
  hearing: { visualNotifications: false },
  cognitive: { simplifiedInstructions: false, fewerTransfers: false },
  speech: { textFirst: false },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessibilityProfile: defaultProfile,
      emergencyContacts: [],
      notifications: [],
      language: 'en',
      textSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      notifPrefs: { outage: true, journey: true, community: true },

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (profile) =>
        set((s) => ({ accessibilityProfile: { ...s.accessibilityProfile, ...profile } })),
      addEmergencyContact: (contact) =>
        set((s) => ({ emergencyContacts: [...s.emergencyContacts, contact] })),
      removeEmergencyContact: (id) =>
        set((s) => ({ emergencyContacts: s.emergencyContacts.filter((c) => c.id !== id) })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false },
            ...s.notifications,
          ],
        })),
      setLanguage: (language) => set({ language }),
      setTextSize: (textSize) => set({ textSize }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setNotifPrefs: (prefs) => set((s) => ({ notifPrefs: { ...s.notifPrefs, ...prefs } })),
    }),
    { name: 'accesschain-app' }
  )
);
