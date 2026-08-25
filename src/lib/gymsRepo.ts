import { supabase, isSupabaseConfigured } from './supabase';
import { GYMS } from '../data/seed';
import { EquipmentGroup, Gym, GymCategory, GymEditableFields } from '../types';

// The decorative side of a gym card (cover gradient) has no real photo
// yet — Supabase carries a real `photos` column for the gallery, used
// once a gym uploads real pictures via the back-office; until then we
// keep serving the same local gradients the demo used, keyed by id, so
// nothing visually regresses.
const LOCAL_BY_ID = new Map(GYMS.map((g) => [g.id, g]));
const FALLBACK_PHOTO = 'pinkViolet';

interface GymRow {
  id: string;
  name: string;
  category: string;
  address: string;
  quartier: string;
  lat: number;
  lng: number;
  photos: string[] | null;
  certified: boolean;
  sponsored: boolean;
  hours: string | null;
  hours_sub: string | null;
  phone: string | null;
  website: string | null;
  price_min: number;
  google_rating: number | null;
  google_reviews: number | null;
  services: Gym['services'];
  formulas: Gym['formulas'];
  tags: string[];
  owner_id: string | null;
  claimed_at: string | null;
}

interface EquipmentRow {
  id: string;
  gym_id: string;
  groupe_musculaire: string;
  nom_machine: string;
  marque: string;
  quantite: number;
}

function groupEquipment(rows: EquipmentRow[], gymId: string): EquipmentGroup[] {
  const byGroup = new Map<string, EquipmentGroup>();
  for (const r of rows) {
    if (r.gym_id !== gymId) continue;
    const g = byGroup.get(r.groupe_musculaire) ?? { group: r.groupe_musculaire, items: [] };
    g.items.push({ id: r.id, name: r.nom_machine, brand: r.marque, qty: r.quantite });
    byGroup.set(r.groupe_musculaire, g);
  }
  return [...byGroup.values()];
}

function mapRow(row: GymRow, equipment: EquipmentRow[]): Gym {
  const local = LOCAL_BY_ID.get(row.id);
  return {
    id: row.id,
    name: row.name,
    category: row.category as GymCategory,
    certified: row.certified,
    sponsored: row.sponsored,
    googleRating: row.google_rating ?? undefined,
    googleReviews: row.google_reviews ?? undefined,
    distanceKm: local?.distanceKm ?? 0, // recomputed against live location where needed; seed value as a safe default
    priceFrom: row.price_min > 0 ? row.price_min : undefined,
    photo: local?.photo ?? FALLBACK_PHOTO,
    tags: row.tags ?? [],
    address: row.address,
    quartier: row.quartier,
    lat: row.lat,
    lng: row.lng,
    hours: row.hours ?? '',
    hoursColor: local?.hoursColor ?? '#140E1F',
    hoursSub: row.hours_sub ?? '',
    phone: row.phone ?? local?.phone,
    website: row.website ?? local?.website,
    services: row.services ?? [],
    formulas: row.formulas ?? [],
    groups: groupEquipment(equipment, row.id),
    coachIds: local?.coachIds ?? [],
    // Real uploaded photos (URLs) take over the moment there are any;
    // the gallery renderer (app/gym/[id].tsx) tells the two apart by
    // whether each entry starts with "http".
    gallery: row.photos && row.photos.length > 0 ? row.photos : local?.gallery ?? [FALLBACK_PHOTO],
    ownerId: row.owner_id ?? undefined,
    claimedAt: row.claimed_at ?? undefined,
  };
}

// Returns null (rather than throwing) when Supabase isn't configured or the
// fetch fails — callers keep using the local demo dataset in that case, so
// this is purely additive and never breaks the app if the network/project
// isn't reachable.
export async function fetchGyms(): Promise<Gym[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const [{ data: gymRows, error: gymErr }, { data: equipRows, error: equipErr }] = await Promise.all([
      supabase.from('gyms').select('*'),
      supabase.from('gym_equipment').select('id, gym_id, groupe_musculaire, nom_machine, marque, quantite'),
    ]);
    if (gymErr || !gymRows) return null;
    const equipment = (equipRows ?? []) as EquipmentRow[];
    return (gymRows as GymRow[]).map((row) => mapRow(row, equipment));
  } catch {
    return null;
  }
}

// Best-effort real writes for the self-service back-office. All resolve to
// false/null (never throw) when Supabase isn't configured or the request
// fails — callers keep the local optimistic update (gymOverrides /
// claimedGymIds / gyms array) either way, so a flaky network never blocks
// the UI, it just means the edit hasn't made it to the shared database yet.

export async function claimGymRemote(gymId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('gyms').update({ owner_id: userId, claimed_at: new Date().toISOString() }).eq('id', gymId).is('owner_id', null);
  return !error;
}

export async function updateGymRemote(gymId: string, partial: Partial<GymEditableFields>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const patch: Record<string, unknown> = {};
  if (partial.name !== undefined) patch.name = partial.name;
  if (partial.category !== undefined) patch.category = partial.category;
  if (partial.address !== undefined) patch.address = partial.address;
  if (partial.quartier !== undefined) patch.quartier = partial.quartier;
  if (partial.hours !== undefined) patch.hours = partial.hours;
  if (partial.hoursSub !== undefined) patch.hours_sub = partial.hoursSub;
  if (partial.phone !== undefined) patch.phone = partial.phone;
  if (partial.website !== undefined) patch.website = partial.website;
  if (partial.priceFrom !== undefined) patch.price_min = partial.priceFrom ?? 0;
  if (partial.tags !== undefined) patch.tags = partial.tags;
  if (partial.services !== undefined) patch.services = partial.services;
  if (partial.formulas !== undefined) patch.formulas = partial.formulas;
  if (partial.gallery !== undefined) patch.photos = partial.gallery.filter((g) => g.startsWith('http'));
  if (Object.keys(patch).length === 0) return true;
  const { error } = await supabase.from('gyms').update(patch).eq('id', gymId);
  return !error;
}

export async function addEquipmentRemote(gymId: string, group: string, name: string, brand: string, qty: number): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('gym_equipment')
    .insert({ gym_id: gymId, groupe_musculaire: group, nom_machine: name, marque: brand, quantite: qty })
    .select('id')
    .single();
  if (error || !data) return null;
  return data.id as string;
}

export async function removeEquipmentRemote(equipmentId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('gym_equipment').delete().eq('id', equipmentId);
  return !error;
}
