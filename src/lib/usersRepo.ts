import { supabase, isSupabaseConfigured } from './supabase';

// Every table this app writes to that has a user_id-shaped column
// (coaches, bookings, reviews, messages, gyms.owner_id...) has a foreign
// key into public.users — a row has to exist here before any of those
// inserts can succeed. Supabase Auth only ever populates auth.users
// automatically; this app-level profile table is ours to keep filled, so
// this fires right after every sign-in (see app/_layout.tsx).
//
// ignoreDuplicates makes this INSERT ... ON CONFLICT DO NOTHING: it only
// ever creates the row once, never overwrites a name/city/etc. a real
// profile edit set later with this best-guess default.
export async function ensureUserProfile(userId: string, name: string, email: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('users').upsert({ id: userId, name, email }, { onConflict: 'id', ignoreDuplicates: true });
  return !error;
}
