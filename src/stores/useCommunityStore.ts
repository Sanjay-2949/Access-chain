import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
export type AssistantType = 'Volunteer' | 'NGO' | 'Paid';

export interface Assistant {
  id: string;
  name: string;
  photo: string;
  type: AssistantType;
  rating: number;
  completedJourneys: number;
  gender: 'Male' | 'Female' | 'Other';
  experience: string[];
  languages: string[];
  verification: VerificationStatus;
  identityVerified: boolean;
  phoneVerified: boolean;
  backgroundChecked: boolean;
  available: boolean;
  availableAt?: string;
  distance: number; // km
  reviews: Review[];
  bio?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  categories: { safety: number; punctuality: number; helpfulness: number; communication: number; accessibilityAwareness: number };
}

export interface AssistanceRequest {
  id: string;
  userId: string;
  assistantId?: string;
  journeyId: string;
  journeyDescription: string;
  assistanceType: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled';
  assistantType: AssistantType;
  meetingPoint?: string;
  notes?: string;
  rating?: { overall: number; comment: string };
}

export interface VolunteerRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  experience: string[];
  assistanceCategories: string[];
  availability: string;
  serviceArea: string;
  gender: string;
  type: 'Volunteer' | 'Paid';
  status: VerificationStatus;
  submittedAt: string;
}

export type ContributorTier = 'Newcomer' | 'Helper' | 'Champion' | 'Guardian';

export interface CommunityContributor {
  userId: string;
  displayName: string;
  points: number;
  badge: ContributorTier;
  verifiedReports: number;
  totalVotes: number;
  lastActive: string;
}

interface CommunityState {
  assistants: Assistant[];
  requests: AssistanceRequest[];
  volunteerRegistrations: VolunteerRegistration[];
  contributors: CommunityContributor[];
  filters: {
    type: AssistantType[];
    gender: string;
    minRating: number;
    experience: string[];
    verified: boolean;
    availableNow: boolean;
  };

  setFilters: (f: Partial<CommunityState['filters']>) => void;
  requestAssistance: (req: Omit<AssistanceRequest, 'id' | 'requestedAt' | 'status'>) => string;
  updateRequestStatus: (id: string, status: AssistanceRequest['status']) => void;
  submitRating: (requestId: string, rating: { overall: number; comment: string }) => void;
  registerVolunteer: (reg: Omit<VolunteerRegistration, 'id' | 'status' | 'submittedAt'>) => void;
  filteredAssistants: () => Assistant[];
  awardPoints: (userId: string, displayName: string, points: number, type: 'vote' | 'report' | 'verification') => void;
}

const mockAssistants: Assistant[] = [
  {
    id: 'a1', name: 'Priya R.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format',
    type: 'Volunteer', rating: 4.9, completedJourneys: 47, gender: 'Female',
    experience: ['Wheelchair assistance', 'Public transport', 'Elderly assistance'],
    languages: ['Tamil', 'English'], verification: 'Verified', identityVerified: true, phoneVerified: true, backgroundChecked: false,
    available: true, availableAt: '3:30 PM', distance: 1.2,
    bio: 'Passionate about inclusive mobility. 3 years volunteering with accessibility NGOs.',
    reviews: [
      { id: 'r1', reviewerName: 'Ramesh K.', rating: 5, comment: 'Incredibly patient and knowledgeable about accessible routes.',
        date: '2026-08-15', categories: { safety: 5, punctuality: 5, helpfulness: 5, communication: 5, accessibilityAwareness: 5 } },
      { id: 'r2', reviewerName: 'Meena S.', rating: 5, comment: 'Priya helped navigate the metro transfer with ease.',
        date: '2026-07-28', categories: { safety: 5, punctuality: 4, helpfulness: 5, communication: 5, accessibilityAwareness: 5 } },
    ],
  },
  {
    id: 'a2', name: 'Arjun M.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    type: 'Paid', rating: 4.7, completedJourneys: 112, gender: 'Male',
    experience: ['Vision assistance', 'Navigation', 'Public transport', 'Wheelchair assistance'],
    languages: ['Tamil', 'English', 'Hindi'], verification: 'Verified', identityVerified: true, phoneVerified: true, backgroundChecked: true,
    available: true, availableAt: 'Now', distance: 0.8,
    bio: 'Professional accessibility assistant with 5 years experience.',
    reviews: [
      { id: 'r3', reviewerName: 'Lakshmi P.', rating: 5, comment: 'Professional, punctual, and very knowledgeable.',
        date: '2026-08-20', categories: { safety: 5, punctuality: 5, helpfulness: 5, communication: 4, accessibilityAwareness: 5 } },
    ],
  },
  {
    id: 'a3', name: 'Enable India – Chennai', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&auto=format',
    type: 'NGO', rating: 4.8, completedJourneys: 340, gender: 'Other',
    experience: ['Wheelchair assistance', 'Elderly assistance', 'Vision assistance', 'Cognitive support'],
    languages: ['Tamil', 'English', 'Telugu', 'Hindi'], verification: 'Verified', identityVerified: true, phoneVerified: true, backgroundChecked: true,
    available: true, availableAt: 'Business hours', distance: 3.1,
    bio: 'Enable India NGO – dedicated to empowering persons with disabilities through inclusive mobility.',
    reviews: [
      { id: 'r4', reviewerName: 'Suresh V.', rating: 5, comment: 'The NGO team was exceptional. Coordinated the entire journey seamlessly.',
        date: '2026-08-10', categories: { safety: 5, punctuality: 4, helpfulness: 5, communication: 5, accessibilityAwareness: 5 } },
    ],
  },
];

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      assistants: mockAssistants,
      requests: [],
      volunteerRegistrations: [],
      contributors: [],
      filters: { type: [], gender: '', minRating: 0, experience: [], verified: false, availableNow: false },

      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),

      awardPoints: (userId, displayName, points, type) => {
        set((s) => {
          const existingIdx = s.contributors.findIndex((c) => c.userId === userId);
          const updated = [...s.contributors];
          const now = new Date().toISOString();

          const computeTier = (pts: number): ContributorTier => {
            if (pts >= 300) return 'Guardian';
            if (pts >= 150) return 'Champion';
            if (pts >= 50) return 'Helper';
            return 'Newcomer';
          };

          if (existingIdx >= 0) {
            const current = updated[existingIdx];
            const newPoints = current.points + points;
            updated[existingIdx] = {
              ...current,
              displayName: displayName || current.displayName,
              points: newPoints,
              badge: computeTier(newPoints),
              totalVotes: type === 'vote' ? current.totalVotes + 1 : current.totalVotes,
              verifiedReports: type === 'report' || type === 'verification' ? current.verifiedReports + 1 : current.verifiedReports,
              lastActive: now,
            };
          } else {
            const newPoints = points;
            updated.push({
              userId,
              displayName: displayName || 'Community Traveler',
              points: newPoints,
              badge: computeTier(newPoints),
              totalVotes: type === 'vote' ? 1 : 0,
              verifiedReports: type === 'report' || type === 'verification' ? 1 : 0,
              lastActive: now,
            });
          }

          updated.sort((a, b) => b.points - a.points);
          return { contributors: updated };
        });
      },

      requestAssistance: (req) => {
        const id = Date.now().toString();
        set((s) => ({
          requests: [{ ...req, id, requestedAt: new Date().toISOString(), status: 'pending' }, ...s.requests],
        }));
        // Simulate assistant accepting after 3s
        setTimeout(() => {
          set((s) => ({
            requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r)),
          }));
        }, 3000);
        return id;
      },

      updateRequestStatus: (id, status) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),

      submitRating: (requestId, rating) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === requestId ? { ...r, rating, status: 'completed' } : r)) })),

      registerVolunteer: (reg) =>
        set((s) => ({
          volunteerRegistrations: [
            { ...reg, id: Date.now().toString(), status: 'Pending', submittedAt: new Date().toISOString() },
            ...s.volunteerRegistrations,
          ],
        })),

      filteredAssistants: () => {
        const { assistants, filters } = get();
        return assistants.filter((a) => {
          if (filters.type.length && !filters.type.includes(a.type)) return false;
          if (filters.gender && filters.gender !== 'Any' && a.gender !== filters.gender) return false;
          if (a.rating < filters.minRating) return false;
          if (filters.experience.length && !filters.experience.some((e) => a.experience.includes(e))) return false;
          if (filters.verified && a.verification !== 'Verified') return false;
          if (filters.availableNow && !a.available) return false;
          return true;
        });
      },
    }),
    { name: 'accesschain-community', partialize: (s) => ({ requests: s.requests, volunteerRegistrations: s.volunteerRegistrations, contributors: s.contributors }) }
  )
);
