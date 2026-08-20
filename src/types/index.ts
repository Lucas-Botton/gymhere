// Data model, mirroring HANDOFF.md section 9 and the Supabase schema in supabase/schema.sql

export type Role = 'member' | 'coach';

export type BookingKind = 'essai' | 'inscription' | 'contact' | 'appel' | 'formule';
export type BookingMode = 'slot' | 'request';
export type BookingStatus = 'en_attente' | 'confirme' | 'accepte' | 'refuse';
export type TargetType = 'gym' | 'coach';
export type ReportReason = 'horaires' | 'tarifs' | 'coordonnees' | 'indisponible' | 'autre';
export type ServiceKey = 'Présentiel salle' | 'Visio' | 'Téléphone';
export type FormuleMode = 'Présentiel' | 'Visio' | 'En ligne';

export interface EquipmentItem {
  name: string;
  brand: string;
  qty: number;
}

export interface EquipmentGroup {
  group: string;
  items: EquipmentItem[];
}

export interface GymService {
  name: string;
  icon: string;
  tint: string;
  color: string;
}

export interface GymFormula {
  name: string;
  sub: string;
  price: string;
  highlight: boolean;
}

// What kind of place this is — shown as a small label under the gym name
// so members know what they're walking into before they even open the
// fiche. Kept as a closed set (rather than free text) so every gym stays
// classified consistently.
export type GymCategory = 'salle' | 'independante' | 'studio' | 'halterophilie' | 'feminin' | 'crossfit' | 'hyrox' | 'ems';

export interface Gym {
  id: string;
  name: string;
  category: GymCategory;
  certified: boolean;
  sponsored: boolean;
  // Google-sourced aggregate only — never gymhere's own reviews (see
  // GymReview below for those). Absent (not 0) means no verified rating
  // was found — the UI must not show stars/counts it can't back up,
  // especially for real gyms.
  googleRating?: number;
  googleReviews?: number;
  distanceKm: number;
  // Absent means no verified public price was found for this specific
  // branch — never a guess. The UI shows "Tarifs sur place" instead.
  priceFrom?: number;
  photo: string; // gradient css-like string, used by GradientBlock
  tags: string[];
  address: string;
  quartier: string;
  lat: number;
  lng: number;
  hours: string;
  hoursColor: string;
  hoursSub: string;
  phone?: string;
  website?: string;
  services: GymService[];
  formulas: GymFormula[];
  groups: EquipmentGroup[];
  coachIds: string[];
  gallery: string[];
}

export interface CoachCredential {
  label: string;
  verified: boolean;
}

export interface CoachOffer {
  name: string;
  mode: FormuleMode;
  duration: string;
  price: string;
  per: string;
  desc: string;
  highlight: boolean;
}

export interface CoachSocials {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
}

export type WeekDay = 'Lun' | 'Mar' | 'Mer' | 'Jeu' | 'Ven' | 'Sam' | 'Dim';
export interface TimeRange {
  from: string;
  to: string;
}
export type Availability = Record<ServiceKey, Partial<Record<WeekDay, TimeRange[]>>>;

export interface Coach {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  zone: string;
  photo: string;
  specs: string[];
  bio: string;
  modalities: string[];
  diplomas: CoachCredential[];
  certifs: CoachCredential[];
  offers: CoachOffer[];
  gymIds: string[];
  socials: CoachSocials;
  gallery: string[];
  availability: Availability;
  published: boolean;
  completion: number;
}

export interface Booking {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  kind: BookingKind;
  mode: BookingMode;
  date: string | null;
  slot: string | null;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  reason: ReportReason;
  message: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  bookingId: string;
  stars: number;
  criteria: Record<string, number>;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  kind: 'system' | 'reco' | 'booking' | 'message';
  icon: string;
  accent: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface ChatThread {
  id: string;
  name: string;
  avatarBg: string;
  role: string;
  messages: ChatMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city: string;
  roles: Role[];
  createdAt: string;
}

// Fiche coach en cours d'édition côté "Espace coach" (avant publication/paiement)
export interface CoachDraft {
  name: string;
  photo: string;
  bio: string;
  zone: string;
  specs: string[];
  modalities: string[];
  diplomas: CoachCredential[];
  certifs: CoachCredential[];
  offers: CoachOffer[];
  gymIds: string[];
  socials: CoachSocials;
  galleryCount: number;
  availability: Availability;
  published: boolean;
}
