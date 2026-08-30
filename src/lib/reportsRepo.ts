import { supabase, isSupabaseConfigured } from './supabase';
import { Report } from '../types';

// Best-effort: fires right after the local optimistic insert in
// useApp.addReport — never throws, resolves false on any failure. Reports
// aren't read back anywhere in the app (moderation-only, read directly in
// Supabase), so unlike bookings/reviews there's nothing to fetch/hydrate,
// and the local id doesn't need to match the DB row (unlike bookings.id,
// reports.id is still a server-generated uuid — fine since nothing needs
// to reconcile it against the local copy).
export async function addReportRemote(report: Report, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('reports').insert({
    user_id: userId,
    target_type: report.targetType,
    target_id: report.targetId,
    reason: report.reason,
    message: report.message,
    created_at: report.createdAt,
  });
  return !error;
}
