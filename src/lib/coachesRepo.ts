import { supabase, isSupabaseConfigured } from './supabase';
import { Availability, Coach, CoachDraft, FormuleMode, SlotMode, WeekDay } from '../types';

const FALLBACK_PHOTO = 'pinkViolet';

function modeToDb(mode: FormuleMode): string {
  return mode === 'Présentiel' ? 'presentiel' : mode === 'Visio' ? 'visio' : 'en_ligne';
}
function modeFromDb(mode: string): FormuleMode {
  return mode === 'presentiel' ? 'Présentiel' : mode === 'visio' ? 'Visio' : 'En ligne';
}
function serviceToDb(service: SlotMode): string {
  return service === 'Présentiel' ? 'presentiel' : 'visio';
}
function serviceFromDb(service: string): SlotMode {
  return service === 'presentiel' ? 'Présentiel' : 'Visio';
}

interface CoachRow {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  specialites: string[];
  zone: string;
  photo_url: string | null;
  published: boolean;
  completion: number;
  socials: Coach['socials'];
  gym_ids: string[];
  rating: number;
  reviews_count: number;
}
interface CredentialRow {
  coach_id: string;
  type: 'diplome' | 'certif';
  label: string;
  verified: boolean;
}
interface FormulaRow {
  coach_id: string;
  nom: string;
  mode: string;
  duree: string | null;
  prix: string;
  per: string | null;
  description: string | null;
  recommande: boolean;
}
interface AvailabilityRow {
  coach_id: string;
  service: string;
  jour: WeekDay;
  heure_debut: string;
  heure_fin: string;
}

function buildAvailability(rows: AvailabilityRow[], coachId: string): Availability {
  const out: Availability = { Présentiel: {}, Visio: {} };
  for (const r of rows) {
    if (r.coach_id !== coachId) continue;
    const mode = serviceFromDb(r.service);
    const arr = out[mode][r.jour] ?? [];
    arr.push({ from: r.heure_debut.slice(0, 5), to: r.heure_fin.slice(0, 5) });
    out[mode][r.jour] = arr;
  }
  return out;
}

// The Coach/CoachDraft's public id is the account's user_id (not the
// coaches table's own uuid) — matching draftToCoach()'s existing
// convention (src/lib/coaches.ts) so a coach's id stays the same whether
// their profile came from the local-only draft synthesis or a real fetch,
// and every booking/routing/coachIds reference stays consistent either way.
function mapToCoach(row: CoachRow, credentials: CredentialRow[], formulas: FormulaRow[], availability: AvailabilityRow[]): Coach {
  return {
    id: row.user_id,
    name: row.name,
    rating: row.rating,
    reviews: row.reviews_count,
    zone: row.zone,
    photo: FALLBACK_PHOTO,
    photoUri: row.photo_url ?? undefined,
    specs: row.specialites ?? [],
    bio: row.bio ?? '',
    modalities: [],
    diplomas: credentials.filter((c) => c.coach_id === row.id && c.type === 'diplome').map((c) => ({ label: c.label, verified: c.verified })),
    certifs: credentials.filter((c) => c.coach_id === row.id && c.type === 'certif').map((c) => ({ label: c.label, verified: c.verified })),
    offers: formulas
      .filter((f) => f.coach_id === row.id)
      .map((f) => ({ name: f.nom, mode: modeFromDb(f.mode), duration: f.duree ?? '', price: f.prix, per: f.per ?? '', desc: f.description ?? '', highlight: f.recommande })),
    gymIds: row.gym_ids ?? [],
    socials: row.socials ?? {},
    gallery: [], // decorative-only for now, see PresentationSheet's galleryCount — not modeled in the DB
    availability: buildAvailability(availability, row.id),
    published: row.published,
    completion: row.completion,
  };
}

function mapToDraft(row: CoachRow, credentials: CredentialRow[], formulas: FormulaRow[], availability: AvailabilityRow[]): CoachDraft {
  const coach = mapToCoach(row, credentials, formulas, availability);
  return {
    name: coach.name,
    photo: FALLBACK_PHOTO,
    photoUri: coach.photoUri,
    bio: coach.bio,
    zone: coach.zone,
    specs: coach.specs,
    modalities: coach.modalities,
    diplomas: coach.diplomas,
    certifs: coach.certifs,
    offers: coach.offers,
    gymIds: coach.gymIds,
    socials: coach.socials,
    galleryCount: 0,
    availability: coach.availability,
    published: coach.published,
  };
}

// Every published coach, for the public list/detail screens — merged with
// the local seed by the caller. Returns null (never throws) when Supabase
// isn't configured or the fetch fails.
export async function fetchPublishedCoaches(): Promise<Coach[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const [{ data: coachRows, error }, { data: credRows }, { data: formulaRows }, { data: availRows }] = await Promise.all([
      supabase.from('coaches').select('*').eq('published', true),
      supabase.from('coach_credentials').select('coach_id, type, label, verified'),
      supabase.from('coach_formulas').select('coach_id, nom, mode, duree, prix, per, description, recommande'),
      supabase.from('coach_availability').select('coach_id, service, jour, heure_debut, heure_fin'),
    ]);
    if (error || !coachRows) return null;
    const credentials = (credRows ?? []) as CredentialRow[];
    const formulas = (formulaRows ?? []) as FormulaRow[];
    const availability = (availRows ?? []) as AvailabilityRow[];
    return (coachRows as CoachRow[]).map((row) => mapToCoach(row, credentials, formulas, availability));
  } catch {
    return null;
  }
}

// The signed-in account's own fiche, published or not — used to hydrate
// coachDraft on a fresh device/reinstall so a coach doesn't lose their
// work. null when there's genuinely nothing saved yet (a brand new coach),
// same as when Supabase isn't configured.
export async function fetchMyCoachDraft(userId: string): Promise<CoachDraft | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: row, error } = await supabase.from('coaches').select('*').eq('user_id', userId).maybeSingle();
    if (error || !row) return null;
    const [{ data: credRows }, { data: formulaRows }, { data: availRows }] = await Promise.all([
      supabase.from('coach_credentials').select('coach_id, type, label, verified').eq('coach_id', row.id),
      supabase.from('coach_formulas').select('coach_id, nom, mode, duree, prix, per, description, recommande').eq('coach_id', row.id),
      supabase.from('coach_availability').select('coach_id, service, jour, heure_debut, heure_fin').eq('coach_id', row.id),
    ]);
    return mapToDraft(row as CoachRow, (credRows ?? []) as CredentialRow[], (formulaRows ?? []) as FormulaRow[], (availRows ?? []) as AvailabilityRow[]);
  } catch {
    return null;
  }
}

// Best-effort full sync of a coach's draft: upserts the coaches row, then
// replaces every child row (credentials/formulas/availability) wholesale.
// Simpler and safe at this scale (a handful of rows per coach) than diffing
// each list — never throws, resolves false on any failure so the caller's
// local coachDraft (already saved via Zustand/AsyncStorage) stays the
// source of truth either way.
export async function syncCoachDraftRemote(userId: string, draft: CoachDraft, completion: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data: coachRow, error: upsertErr } = await supabase
      .from('coaches')
      .upsert(
        {
          user_id: userId,
          name: draft.name || 'Coach gymhere',
          bio: draft.bio,
          specialites: draft.specs,
          zone: draft.zone,
          photo_url: draft.photoUri ?? null,
          published: draft.published,
          completion,
          socials: draft.socials,
          gym_ids: draft.gymIds,
        },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single();
    if (upsertErr || !coachRow) return false;
    const coachId = coachRow.id as string;

    const credentialRows = [
      ...draft.diplomas.map((d) => ({ coach_id: coachId, type: 'diplome', label: d.label, verified: d.verified })),
      ...draft.certifs.map((c) => ({ coach_id: coachId, type: 'certif', label: c.label, verified: c.verified })),
    ];
    const formulaRows = draft.offers.map((o) => ({
      coach_id: coachId,
      nom: o.name,
      mode: modeToDb(o.mode),
      duree: o.duration || null,
      prix: o.price,
      per: o.per || null,
      description: o.desc || null,
      recommande: o.highlight,
    }));
    const availabilityRows: Record<string, unknown>[] = [];
    (Object.keys(draft.availability) as SlotMode[]).forEach((mode) => {
      const byDay = draft.availability[mode] ?? {};
      (Object.keys(byDay) as WeekDay[]).forEach((day) => {
        (byDay[day] ?? []).forEach((range) => {
          availabilityRows.push({ coach_id: coachId, service: serviceToDb(mode), jour: day, heure_debut: range.from, heure_fin: range.to });
        });
      });
    });

    await Promise.all([
      supabase.from('coach_credentials').delete().eq('coach_id', coachId),
      supabase.from('coach_formulas').delete().eq('coach_id', coachId),
      supabase.from('coach_availability').delete().eq('coach_id', coachId),
    ]);
    await Promise.all([
      credentialRows.length ? supabase.from('coach_credentials').insert(credentialRows) : Promise.resolve(),
      formulaRows.length ? supabase.from('coach_formulas').insert(formulaRows) : Promise.resolve(),
      availabilityRows.length ? supabase.from('coach_availability').insert(availabilityRows) : Promise.resolve(),
    ]);
    return true;
  } catch {
    return false;
  }
}
