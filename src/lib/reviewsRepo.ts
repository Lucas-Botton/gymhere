import { supabase, isSupabaseConfigured } from './supabase';
import { Review, TargetType } from '../types';

interface ReviewRow {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  booking_id: string;
  note: number;
  criteres: Record<string, number>;
  tags: string[];
  commentaire: string | null;
  created_at: string;
}

function mapRow(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    bookingId: row.booking_id,
    stars: row.note,
    criteria: row.criteres ?? {},
    tags: row.tags ?? [],
    comment: row.commentaire ?? '',
    createdAt: row.created_at,
  };
}

// Every review, for every gym/coach — reviews are public by design (RLS:
// "reviews are public"), so this is fetched once at boot for everyone, not
// gated behind sign-in. null (never throws) when Supabase isn't configured
// or the fetch fails, so the app keeps working off whatever's local.
export async function fetchReviews(): Promise<Review[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return (data as ReviewRow[]).map(mapRow);
  } catch {
    return null;
  }
}

// Fires right after the local optimistic insert in useApp.addReview —
// never throws, resolves false on any failure so the author's local copy
// (already persisted) stays what they see either way.
export async function addReviewRemote(review: Review): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('reviews').insert({
    id: review.id,
    user_id: review.userId,
    target_type: review.targetType,
    target_id: review.targetId,
    booking_id: review.bookingId,
    note: review.stars,
    criteres: review.criteria,
    tags: review.tags,
    commentaire: review.comment,
    created_at: review.createdAt,
  });
  return !error;
}
