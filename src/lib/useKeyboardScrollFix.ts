import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';

// BottomSheet's own keyboard-avoidance shift is intentionally capped small
// (a taller sheet barely moves, to avoid an earlier regression where it got
// shoved clean off-screen) — nowhere near enough to reveal a field sitting
// near the bottom of a sheet's scrollable content. Wire this up on any
// TextInput that can end up there: spread scrollProps onto the sheet's
// ScrollView and inputProps onto that TextInput's onFocus/onBlur.
export function useKeyboardScrollFix(extraPadding = 260) {
  const scrollRef = useRef<ScrollView>(null);
  const [typing, setTyping] = useState(false);

  const onFocusInput = () => {
    setTyping(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };
  const onBlurInput = () => setTyping(false);

  return {
    scrollRef,
    scrollProps: { ref: scrollRef, keyboardShouldPersistTaps: 'handled' as const },
    contentPaddingBottom: (basePadding: number) => (typing ? basePadding + extraPadding : basePadding),
    inputProps: { onFocus: onFocusInput, onBlur: onBlurInput },
  };
}
