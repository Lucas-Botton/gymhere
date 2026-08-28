import { supabase, isSupabaseConfigured } from './supabase';
import { Booking, BookingKind, BookingMode, BookingStatus, TargetType } from '../types';

interface BookingRow {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  target_name: string;
  from_name: string;
  kind: BookingKind;
  mode: BookingMode;
  date: string | null;
  slot: string | null;
  message: string | null;
  statut: BookingStatus;
  created_at: string;
}

function mapRow(row: BookingRow): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    targetName: row.target_name,
    fromName: row.from_name || undefined,
    kind: row.kind,
    mode: row.mode,
    date: row.date,
    slot: row.slot,
    message: row.message ?? '',
    status: row.statut,
    createdAt: row.created_at,
  };
}

// Fires right after the local optimistic insert in useApp.addBooking —
// never throws, resolves false on any failure (unconfigured Supabase,
// network) so the requester's local copy (already persisted via
// Zustand/AsyncStorage) stays what they see either way. fromName is
// denormalized onto the row so the target (coach/salle) can show who's
// asking without needing cross-user read access to the users table.
export async function addBookingRemote(booking: Booking, fromName: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('bookings').insert({
    id: booking.id,
    user_id: booking.userId,
    target_type: booking.targetType,
    target_id: booking.targetId,
    target_name: booking.targetName,
    from_name: fromName,
    kind: booking.kind,
    mode: booking.mode,
    date: booking.date,
    slot: booking.slot,
    message: booking.message,
    statut: booking.status,
    created_at: booking.createdAt,
  });
  return !error;
}

// Restores a signed-in member's own booking history on a fresh
// device/reinstall (mirrors fetchMyCoachDraft) — null on any failure.
export async function fetchMyBookings(userId: string): Promise<Booking[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error || !data) return null;
    return (data as BookingRow[]).map(mapRow);
  } catch {
    return null;
  }
}

// Every booking sent TO the signed-in coach (target_type='coach', target_id
// = their own user id, per the "coach public id = user_id" convention) —
// powers the "Demandes reçues" screen. Requires the RLS policy "bookings
// target coach read" in schema.sql.
export async function fetchIncomingCoachBookings(coachUserId: string): Promise<Booking[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('target_type', 'coach')
      .eq('target_id', coachUserId)
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return (data as BookingRow[]).map(mapRow);
  } catch {
    return null;
  }
}

// Every booking sent to a gym the signed-in account owns — same idea, for
// a future gym-side "demandes reçues" screen. Requires "bookings target
// gym read" (join on gyms.owner_id, since target_id is the gym's id, not
// a user id).
export async function fetchIncomingGymBookings(gymId: string): Promise<Booking[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('target_type', 'gym')
      .eq('target_id', gymId)
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return (data as BookingRow[]).map(mapRow);
  } catch {
    return null;
  }
}

// Accept/decline from either side — the target (coach/salle) is the only
// one allowed to move a booking out of 'en_attente' (see the two "...
// update status" RLS policies), the requester can't self-approve.
export async function updateBookingStatusRemote(bookingId: string, status: BookingStatus): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('bookings').update({ statut: status }).eq('id', bookingId);
  return !error;
}
