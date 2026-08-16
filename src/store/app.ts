import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  Availability,
  Booking,
  BookingKind,
  BookingMode,
  ChatMessage,
  ChatThread,
  CoachDraft,
  Review,
  ServiceKey,
  TargetType,
  WeekDay,
} from '../types';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const emptyAvailability: Availability = {
  'Présentiel salle': {},
  Visio: {},
  Téléphone: {},
};

const defaultCoachDraft: CoachDraft = {
  name: '',
  photo: 'pinkViolet',
  bio: '',
  specs: [],
  modalities: [],
  diplomas: [],
  certifs: [],
  offers: [],
  gymIds: [],
  socials: {},
  galleryCount: 0,
  availability: emptyAvailability,
  published: false,
};

interface InboxEntry {
  id: string;
  fromName: string;
  avatarGradient: string;
  offer: string;
  message: string;
  ago: string;
  decided: 'accepted' | 'declined' | null;
}

const seedInbox: InboxEntry[] = [
  { id: 'q1', fromName: 'Thomas M.', avatarGradient: 'pinkViolet', offer: 'Suivi en ligne complet', message: 'Salut ! Je débute et j’aimerais un accompagnement sur la prise de masse. Dispo en télétravail la journée.', ago: 'il y a 2h', decided: null },
  { id: 'q2', fromName: 'Sarah B.', avatarGradient: 'blueMint', offer: 'Séance en présentiel', message: 'Bonjour, objectif HYROX en novembre. Une séance d’essai possible cette semaine ?', ago: 'il y a 5h', decided: null },
  { id: 'q3', fromName: 'Karim D.', avatarGradient: 'coralPink', offer: 'Appel découverte', message: 'Merci pour l’appel, on démarre lundi 💪', ago: 'hier', decided: 'accepted' },
];

interface Filters {
  equipQuery: string;
  muscles: string[];
  brands: string[];
  services: string[];
  priceMax: number;
  distance: number;
  minRating: number;
}

const defaultFilters: Filters = {
  equipQuery: '',
  muscles: [],
  brands: [],
  services: [],
  priceMax: 60,
  distance: 12,
  minRating: 0,
};

interface AppState {
  favGyms: string[];
  favCoaches: string[];
  toggleFavGym: (id: string) => void;
  toggleFavCoach: (id: string) => void;

  goal: string | null;
  goalDismissed: boolean;
  setGoal: (key: string | null) => void;
  dismissGoal: () => void;

  filters: Filters;
  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;

  bookings: Booking[];
  addBooking: (input: {
    targetType: TargetType;
    targetId: string;
    targetName: string;
    kind: BookingKind;
    mode: BookingMode;
    date?: string | null;
    slot?: string | null;
    message?: string;
  }) => Booking;

  reviews: Review[];
  addReview: (input: { bookingId: string; targetType: TargetType; targetId: string; stars: number; criteria: Record<string, number>; tags: string[]; comment: string }) => void;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  threads: Record<string, ChatThread>;
  sendMessage: (threadId: string, text: string) => void;
  ensureThread: (threadId: string, seed: Omit<ChatThread, 'id' | 'messages'> & { messages?: ChatMessage[] }) => void;

  coachDraft: CoachDraft;
  updateCoachDraft: (partial: Partial<CoachDraft>) => void;
  addCredential: (kind: 'diplomas' | 'certifs', label: string) => void;
  removeCredential: (kind: 'diplomas' | 'certifs', label: string) => void;
  addSlot: (service: ServiceKey, day: WeekDay, from: string, to: string) => void;
  removeSlot: (service: ServiceKey, day: WeekDay, index: number) => void;
  togglePublished: () => void;
  coachPlan: 'gratuit' | 'actif';
  activateCoachPlan: () => void;

  inbox: InboxEntry[];
  decideInbox: (id: string, decision: 'accepted' | 'declined') => void;

  toast: string;
  showToast: (msg: string) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      favGyms: [],
      favCoaches: [],
      toggleFavGym: (id) =>
        set((s) => ({ favGyms: s.favGyms.includes(id) ? s.favGyms.filter((x) => x !== id) : [...s.favGyms, id] })),
      toggleFavCoach: (id) =>
        set((s) => ({ favCoaches: s.favCoaches.includes(id) ? s.favCoaches.filter((x) => x !== id) : [...s.favCoaches, id] })),

      goal: null,
      goalDismissed: false,
      setGoal: (key) => set({ goal: key }),
      dismissGoal: () => set({ goalDismissed: true }),

      filters: defaultFilters,
      setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
      resetFilters: () => set({ filters: defaultFilters }),

      bookings: [],
      addBooking: (input) => {
        const booking: Booking = {
          id: uid(),
          userId: 'me',
          targetType: input.targetType,
          targetId: input.targetId,
          targetName: input.targetName,
          kind: input.kind,
          mode: input.mode,
          date: input.date ?? null,
          slot: input.slot ?? null,
          message: input.message ?? '',
          status: input.mode === 'slot' ? 'confirme' : 'en_attente',
          createdAt: new Date().toISOString(),
        };
        const notif: AppNotification = {
          id: uid(),
          kind: 'booking',
          icon: input.mode === 'slot' ? '✓' : '✦',
          accent: '#F5397F',
          title: input.mode === 'slot' ? 'C’est réservé' : 'Demande envoyée',
          body: `${input.targetName} · ${input.kind === 'contact' ? 'ton message a bien été transmis' : 'tu recevras une réponse très vite'}.`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({ bookings: [booking, ...s.bookings], notifications: [notif, ...s.notifications] }));
        return booking;
      },

      reviews: [],
      addReview: (input) =>
        set((s) => ({
          reviews: [
            {
              id: uid(),
              userId: 'me',
              targetType: input.targetType,
              targetId: input.targetId,
              bookingId: input.bookingId,
              stars: input.stars,
              criteria: input.criteria,
              tags: input.tags,
              comment: input.comment,
              createdAt: new Date().toISOString(),
            },
            ...s.reviews,
          ],
        })),

      notifications: [
        {
          id: 'n1',
          kind: 'system',
          icon: '✦',
          accent: '#8B5CFF',
          title: 'Bienvenue sur gymhere 👋',
          body: 'Explore les salles de Lyon, trouve ton matériel et réserve ta première séance d’essai.',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          read: false,
        },
        {
          id: 'n2',
          kind: 'reco',
          icon: '★',
          accent: '#F5397F',
          title: 'Iron Presqu’île te correspond',
          body: 'Hack squat Panatta, sauna, ouvert 24/7, à 0,4 km de toi. Va jeter un œil !',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          read: true,
        },
      ],
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      threads: {},
      ensureThread: (threadId, seed) =>
        set((s) => (s.threads[threadId] ? s : { threads: { ...s.threads, [threadId]: { id: threadId, messages: seed.messages ?? [], ...seed } } })),
      sendMessage: (threadId, text) => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        set((s) => {
          const t = s.threads[threadId];
          if (!t) return s;
          return { threads: { ...s.threads, [threadId]: { ...t, messages: [...t.messages, { from: 'me', text, time: hh }] } } };
        });
        const replies = ['Super, on cale ça 💪', 'Parfait, je te prépare un premier plan.', 'Top ! Je reviens vers toi très vite.', 'Ça marche, à très vite 🙌'];
        setTimeout(() => {
          const now2 = new Date();
          const hh2 = String(now2.getHours()).padStart(2, '0') + ':' + String(now2.getMinutes()).padStart(2, '0');
          const reply = replies[Math.floor(Math.random() * replies.length)];
          set((s) => {
            const t = s.threads[threadId];
            if (!t) return s;
            return { threads: { ...s.threads, [threadId]: { ...t, messages: [...t.messages, { from: 'them', text: reply, time: hh2 }] } } };
          });
        }, 1100);
      },

      coachDraft: defaultCoachDraft,
      updateCoachDraft: (partial) => set((s) => ({ coachDraft: { ...s.coachDraft, ...partial } })),
      addCredential: (kind, label) => {
        const l = label.trim();
        if (!l) return;
        set((s) => {
          if (s.coachDraft[kind].some((c) => c.label.toLowerCase() === l.toLowerCase())) return s;
          return { coachDraft: { ...s.coachDraft, [kind]: [...s.coachDraft[kind], { label: l, verified: false }] } };
        });
      },
      removeCredential: (kind, label) =>
        set((s) => ({ coachDraft: { ...s.coachDraft, [kind]: s.coachDraft[kind].filter((c) => c.label !== label) } })),
      addSlot: (service, day, from, to) => {
        if (!from || !to || from >= to) return;
        set((s) => {
          const svc = { ...(s.coachDraft.availability[service] ?? {}) };
          const arr = [...(svc[day] ?? []), { from, to }].sort((a, b) => (a.from < b.from ? -1 : 1));
          svc[day] = arr;
          return { coachDraft: { ...s.coachDraft, availability: { ...s.coachDraft.availability, [service]: svc } } };
        });
      },
      removeSlot: (service, day, index) =>
        set((s) => {
          const svc = { ...(s.coachDraft.availability[service] ?? {}) };
          svc[day] = (svc[day] ?? []).filter((_, i) => i !== index);
          return { coachDraft: { ...s.coachDraft, availability: { ...s.coachDraft.availability, [service]: svc } } };
        }),
      togglePublished: () => set((s) => ({ coachDraft: { ...s.coachDraft, published: !s.coachDraft.published } })),
      coachPlan: 'gratuit',
      activateCoachPlan: () => set({ coachPlan: 'actif' }),

      inbox: seedInbox,
      decideInbox: (id, decision) => set((s) => ({ inbox: s.inbox.map((i) => (i.id === id ? { ...i, decided: decision } : i)) })),

      toast: '',
      showToast: (msg) => {
        set({ toast: msg });
        setTimeout(() => set((s) => (s.toast === msg ? { toast: '' } : s)), 2200);
      },
    }),
    {
      name: 'gymhere-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        favGyms: s.favGyms,
        favCoaches: s.favCoaches,
        goal: s.goal,
        goalDismissed: s.goalDismissed,
        bookings: s.bookings,
        reviews: s.reviews,
        notifications: s.notifications,
        threads: s.threads,
        coachDraft: s.coachDraft,
        coachPlan: s.coachPlan,
        inbox: s.inbox,
      }),
    }
  )
);

export function computeCompletion(draft: CoachDraft): number {
  let score = 0;
  const total = 7;
  if (draft.bio.trim().length > 20) score++;
  if (draft.specs.length > 0) score++;
  if (draft.offers.length > 0) score++;
  if (draft.diplomas.length > 0 || draft.certifs.length > 0) score++;
  if (Object.values(draft.availability).some((byDay) => Object.keys(byDay ?? {}).length > 0)) score++;
  if (draft.gymIds.length > 0) score++;
  if (draft.galleryCount > 0) score++;
  return Math.round((score / total) * 100);
}
