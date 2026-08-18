import { Gym } from '../types';

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function gymMuscleGroups(g: Gym): string[] {
  return g.groups.map((gr) => gr.group);
}

export function gymBrands(g: Gym): string[] {
  const set = new Set<string>();
  g.groups.forEach((gr) => gr.items.forEach((it) => set.add(it.brand)));
  set.delete('–');
  return [...set];
}

export function gymServiceNames(g: Gym): string[] {
  return g.services.map((s) => s.name);
}

export interface EquipIndexItem {
  name: string;
  brand: string;
  qty: number;
  group: string;
}

export function equipmentIndex(g: Gym): EquipIndexItem[] {
  const out: EquipIndexItem[] = [];
  g.groups.forEach((gr) => gr.items.forEach((it) => out.push({ ...it, group: gr.group })));
  return out;
}

export function gymEquipHit(g: Gym, needle: string): boolean {
  const n = normalize(needle);
  return equipmentIndex(g).some((it) => normalize(it.name).includes(n) || normalize(it.brand).includes(n));
}

export interface FiltersInput {
  equipItems: string[];
  muscles: string[];
  brands: string[];
  services: string[];
  priceMax: number;
  distance: number;
  minRating: number;
}

// Real distance from the given coords when available, falling back to the
// gym's demo-data distance otherwise (pure function; see useGymDistanceKm
// for the hook version used inside components).
export function gymDistanceKm(g: Gym, coords: { lat: number; lng: number } | null): number {
  return coords ? haversineKm(coords, { lat: g.lat, lng: g.lng }) : g.distanceKm;
}

export function gymPassesFilters(g: Gym, f: FiltersInput, coords: { lat: number; lng: number } | null = null): boolean {
  return (
    g.rating >= f.minRating &&
    g.priceFrom <= f.priceMax &&
    gymDistanceKm(g, coords) <= f.distance &&
    (f.equipItems.length === 0 || f.equipItems.every((eq) => gymEquipHit(g, eq))) &&
    (f.muscles.length === 0 || f.muscles.every((m) => gymMuscleGroups(g).includes(m))) &&
    (f.brands.length === 0 || f.brands.some((b) => gymBrands(g).includes(b))) &&
    (f.services.length === 0 || f.services.every((s) => gymServiceNames(g).includes(s)))
  );
}

export function activeFilterCount(f: FiltersInput): number {
  return f.brands.length + f.services.length + f.muscles.length + f.equipItems.length + (f.minRating > 0 ? 1 : 0);
}

export interface SearchResult {
  id: string;
  isEquip: boolean;
  badgeLabel: string;
  matchMore: string;
  activeGroup: string | null;
}

export function searchGyms(query: string, gyms: Gym[]): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const out: SearchResult[] = [];
  gyms.forEach((g) => {
    const matches = equipmentIndex(g).filter((it) => normalize(it.name).includes(q) || normalize(it.brand).includes(q));
    const nameHit = normalize(g.name).includes(q);
    const zoneHit = normalize(g.address).includes(q) || g.tags.some((t) => normalize(t).includes(q));
    if (matches.length === 0 && !nameHit && !zoneHit) return;
    const totalQty = matches.reduce((n, m) => n + m.qty, 0);
    const isEquip = matches.length > 0;
    out.push({
      id: g.id,
      isEquip,
      badgeLabel: isEquip
        ? `${totalQty}× ${matches[0].name}${matches[0].brand !== '–' ? ' · ' + matches[0].brand : ''}`
        : nameHit
        ? 'Salle'
        : g.address,
      matchMore: isEquip && matches.length > 1 ? `+${matches.length - 1} autre${matches.length - 1 > 1 ? 's' : ''}` : '',
      activeGroup: isEquip ? matches[0].group : null,
    });
  });
  return out;
}

export const POPULAR_EQUIPMENT = ['Hack squat', 'SkiErg', 'Assault bike', 'Squat rack', 'Rameur', 'Presse à cuisses', 'Soulevé de terre', 'Sled push', 'Eleiko', 'Hammer Strength'];
export const POPULAR_ZONES = ['Presqu’île', 'Croix-Rousse', 'Confluence', 'Gerland', 'Vaise'];

export function distanceLabel(km: number): string {
  return km.toFixed(1).replace('.', ',') + ' km';
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
