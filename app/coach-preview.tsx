import React from 'react';
import { useApp } from '../src/store/app';
import { useSession } from '../src/store/session';
import { draftToCoach } from '../src/lib/coaches';
import CoachDetailView from '../src/components/coach/CoachDetailView';

// Renders the coach's OWN draft through the exact same component a real
// member sees at /coach/[id] — the only difference is this bypasses the
// publish/plan gate (so you can preview before going live) and passes
// previewMode to hide booking actions. No more hand-duplicated markup that
// silently drifts from the real fiche (it used to skip availability,
// gallery, socials and reviews entirely).
export default function CoachPreview() {
  const draft = useApp((s) => s.coachDraft);
  const userId = useSession((s) => s.user?.id) ?? 'me';
  const coach = draftToCoach(draft, userId);

  return <CoachDetailView coach={coach} previewMode />;
}
