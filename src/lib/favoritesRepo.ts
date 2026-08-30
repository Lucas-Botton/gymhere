import { supabase, isSupabaseConfigured } from './supabase';
import { TargetType } from '../types';

// Best-effort: fires right after the local optimistic toggle in
// useApp.toggleFavGym/toggleFavCoach — never throws, resolves false on any
// failure so the local list (already persisted) stays what the device
// shows either way; only cross-device sync would be missing.
export async function toggleFavoriteRemote(userId: string, targetType: TargetType, targetId: string, isFavorite: boolean): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  if (isFavorite) {
    const { error } = await supabase.from('favorites').insert({ user_id: userId, target_type: targetType, target_id: targetId });
    return !error;
  }
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('target_type', targetType).eq('target_id', targetId);
  return !error;
}

// Restores this account's favorites on a fresh device/reinstall — null
// (never throws) when Supabase isn't configured or the fetch fails.
export async function fetchFavorites(userId: string): Promise<{ gymIds: string[]; coachIds: string[] } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('favorites').select('target_type, target_id').eq('user_id', userId);
    if (error || !data) return null;
    const rows = data as { target_type: TargetType; target_id: string }[];
    return {
      gymIds: rows.filter((r) => r.target_type === 'gym').map((r) => r.target_id),
      coachIds: rows.filter((r) => r.target_type === 'coach').map((r) => r.target_id),
    };
  } catch {
    return null;
  }
}
