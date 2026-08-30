import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role, UserProfile } from '../types';
import { signOutSupabase } from '../lib/auth';

interface PendingAction {
  kind: string;
  label: string;
  resume: () => void;
}

interface SessionState {
  hasOnboarded: boolean;
  city: string;
  role: Role | null;
  loggedIn: boolean;
  isCoach: boolean;
  // Self-service gym back-office: the id of the gym this account manages,
  // if any (one claimed gym per account, like one coach fiche per
  // account). Separate from `role`/`isCoach` — managing a gym isn't a
  // whole parallel app mode the way coach is, just an unlocked screen.
  ownedGymId: string | null;
  user: UserProfile | null;
  authOpen: boolean;
  authActionLabel: string;
  pendingAction: PendingAction | null;

  setHasOnboarded: (v: boolean) => void;
  setCity: (c: string) => void;
  chooseRole: (r: Role) => void;
  requireAuth: (label: string, resume: () => void) => void;
  closeAuth: () => void;
  login: (profile?: Partial<UserProfile>) => void;
  logout: () => void;
  setAvatarUrl: (uri: string) => void;
  // Overlays locally-entered profile fields (e.g. the name/phone typed
  // into coach-signup) on top of whatever syncFromSupabase derived from
  // the auth session — a real e-mail OTP session has no name/phone of its
  // own to give back.
  updateProfile: (partial: Partial<UserProfile>) => void;
  becomeCoach: () => void;
  backToMember: () => void;
  claimGym: (gymId: string) => void;
  syncFromSupabase: (user: { id: string; email?: string | null } | null) => void;
  resetOnboarding: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      city: 'Lyon',
      role: null,
      loggedIn: false,
      isCoach: false,
      ownedGymId: null,
      user: null,
      authOpen: false,
      authActionLabel: '',
      pendingAction: null,

      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setCity: (c) => set({ city: c }),
      chooseRole: (r) => set({ role: r }),

      requireAuth: (label, resume) => {
        if (get().loggedIn) {
          resume();
          return;
        }
        set({ authOpen: true, authActionLabel: label, pendingAction: { kind: 'generic', label, resume } });
      },
      closeAuth: () => set({ authOpen: false, pendingAction: null }),

      login: (profile) => {
        const pending = get().pendingAction;
        set({
          loggedIn: true,
          authOpen: false,
          pendingAction: null,
          user: {
            id: 'me',
            name: profile?.name ?? 'Alex',
            email: profile?.email ?? 'alex@email.com',
            city: get().city,
            roles: ['member'],
            createdAt: new Date().toISOString(),
            ...profile,
          },
        });
        if (pending) setTimeout(() => pending.resume(), 60);
      },
      logout: () => {
        signOutSupabase().catch(() => {});
        set({ loggedIn: false, user: null, isCoach: false, role: null });
      },
      setAvatarUrl: (uri) => set((s) => (s.user ? { user: { ...s.user, avatarUrl: uri } } : s)),
      updateProfile: (partial) => set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),

      becomeCoach: () => set({ isCoach: true, role: 'coach', loggedIn: true }),
      backToMember: () => set({ role: 'member' }),
      claimGym: (gymId) => set({ ownedGymId: gymId, loggedIn: true }),

      // Appelé au démarrage quand un projet Supabase est branché, pour resynchroniser
      // la session locale avec la session Supabase réelle (voir app/_layout.tsx).
      syncFromSupabase: (supaUser) => {
        if (!supaUser) {
          set({ loggedIn: false, user: null });
          return;
        }
        const existing = get().user;
        const pending = get().pendingAction;
        set({
          loggedIn: true,
          authOpen: false,
          pendingAction: null,
          user: {
            id: supaUser.id,
            name: existing?.name ?? supaUser.email?.split('@')[0] ?? 'Toi',
            email: supaUser.email ?? existing?.email ?? '',
            city: get().city,
            roles: existing?.roles ?? ['member'],
            createdAt: existing?.createdAt ?? new Date().toISOString(),
          },
        });
        if (pending) setTimeout(() => pending.resume(), 60);
      },

      // Pour revoir l'écran de bienvenue (géoloc + choix du rôle) : l'app ne
      // le montre normalement qu'une seule fois, comme toute app grand public.
      resetOnboarding: () => set({ hasOnboarded: false, role: null }),
    }),
    {
      name: 'gymhere-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        city: s.city,
        role: s.role,
        loggedIn: s.loggedIn,
        isCoach: s.isCoach,
        ownedGymId: s.ownedGymId,
        user: s.user,
      }),
    }
  )
);
