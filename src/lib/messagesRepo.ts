import { supabase, isSupabaseConfigured } from './supabase';
import { ChatMessage } from '../types';

// Canonical, deterministic thread id for a 1:1 conversation between two
// users — sorted so both participants land on the exact same id
// independently, with no lookup table needed on either side.
export function threadIdFor(userA: string, userB: string): string {
  return [userA, userB].sort().join(':');
}

interface MessageRow {
  id: string;
  thread_id: string;
  from_user: string;
  to_user: string;
  texte: string;
  created_at: string;
}

function mapRow(row: MessageRow, myUserId: string): ChatMessage {
  const time = new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return { from: row.from_user === myUserId ? 'me' : 'them', text: row.texte, time };
}

// Full history for a thread — null (never throws) when Supabase isn't
// configured or the fetch fails, in which case the caller just keeps
// whatever's local (nothing, for a brand new conversation).
export async function fetchThreadMessages(threadId: string, myUserId: string): Promise<ChatMessage[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
    if (error || !data) return null;
    return (data as MessageRow[]).map((row) => mapRow(row, myUserId));
  } catch {
    return null;
  }
}

// Fires right after the local optimistic append in useApp.sendMessage —
// never throws, resolves false on any failure so the sender's own view of
// the conversation (already updated locally) stays what they see either
// way; only the other participant's device would miss it until they
// reopen the thread.
export async function sendMessageRemote(threadId: string, fromUser: string, toUser: string, text: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('messages').insert({ thread_id: threadId, from_user: fromUser, to_user: toUser, texte: text });
  return !error;
}

// Live delivery while a thread is open: calls onMessage for every row
// inserted into it, including our own sends (the caller should ignore
// those — it already showed them optimistically). Requires Realtime
// enabled on public.messages (see schema.sql). Returns an unsubscribe
// function; a no-op when Supabase isn't configured, so callers can always
// call it unconditionally in a cleanup effect.
export function subscribeToThread(threadId: string, myUserId: string, onMessage: (msg: ChatMessage) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`messages:${threadId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` }, (payload: { new: MessageRow }) => {
      onMessage(mapRow(payload.new, myUserId));
    })
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
