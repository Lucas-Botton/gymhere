import { COACHES, findCoach as findSeedCoach } from '../data/seed';
import { useApp, computeCompletion } from '../store/app';
import { useSession } from '../store/session';
import { Coach, CoachDraft } from '../types';

export function draftToCoach(draft: CoachDraft, id: string): Coach {
  const galleryCount = Math.min(Math.max(draft.galleryCount, 1), 6);
  return {
    id,
    name: draft.name || 'Coach gymhere',
    rating: 0,
    reviews: 0,
    zone: draft.zone || 'Lyon',
    photo: draft.photo,
    specs: draft.specs,
    bio: draft.bio,
    modalities: draft.modalities,
    diplomas: draft.diplomas,
    certifs: draft.certifs,
    offers: draft.offers,
    gymIds: draft.gymIds,
    socials: draft.socials,
    gallery: Array.from({ length: galleryCount }, () => draft.photo),
    availability: draft.availability,
    published: draft.published,
    completion: computeCompletion(draft),
  };
}

// The coach currently signed in on this device, as a real Coach object —
// only once they've actually published (and, once billing is real, are on
// an active plan). null otherwise, exactly like any other coach not found.
export function useMyCoachProfile(): Coach | null {
  const draft = useApp((s) => s.coachDraft);
  const coachPlan = useApp((s) => s.coachPlan);
  const userId = useSession((s) => s.user?.id);
  if (!userId || !draft.published || coachPlan !== 'actif') return null;
  return draftToCoach(draft, userId);
}

// Same lookup findCoach() does over the static seed list, but also checking
// the current device's own published coach profile — this is what makes a
// coach who signed up through the app actually findable/bookable, instead
// of only ever the 3 demo profiles baked into seed.ts.
export function findCoachAlso(id: string | null | undefined, mine: Coach | null): Coach | null {
  if (id && mine && mine.id === id) return mine;
  return findSeedCoach(id);
}

// Convenience hook for the common case: looking up exactly one coach by id
// inside a component's render body.
export function useFindCoach(id: string | null | undefined): Coach | null {
  const mine = useMyCoachProfile();
  return findCoachAlso(id, mine);
}

export function useAllCoaches(): Coach[] {
  const mine = useMyCoachProfile();
  return mine ? [...COACHES, mine] : COACHES;
}
