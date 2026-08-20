import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { PinMark } from '../src/components/ui/Logo';
import Text from '../src/components/ui/Text';
import { colors, displayFont } from '../src/theme';
import { useSession } from '../src/store/session';

// DESIGN-SPLASH.md: same brand gradient + pin mark as before (nothing in
// the logo or palette changes here) — only layout (a single centered
// block instead of icon-top/wordmark-bottom) and a premium entrance
// animation replace the two old spinners.
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const ICON_BOX = 104;
const HALO_SIZE = 520; // ~260px radius
const HERE_TEXT_STYLE = { fontSize: 30, letterSpacing: -1.3 };
const EXIT_AT_MS = 1600;
const EXIT_DURATION_MS = 350;

export default function Splash() {
  const { hasOnboarded, isCoach, role } = useSession();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [ready, setReady] = useState(false);

  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.86);
  const iconTranslateY = useSharedValue(-40);
  const breathScale = useSharedValue(1);
  const ringScale = useSharedValue(0.3);
  const ringOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);
  const wordOpacity = useSharedValue(0);
  const wordTranslateY = useSharedValue(10);
  const haloOpacity = useSharedValue(0.8);
  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduceMotion(!!v);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const goNext = () => {
      if (!hasOnboarded) router.replace('/onboarding');
      else if (role === 'coach' && isCoach) router.replace('/(coach)/ma-fiche');
      else router.replace('/(member)/explore');
    };

    if (reduceMotion) {
      iconOpacity.value = withTiming(1, { duration: 300 });
      iconScale.value = 1;
      iconTranslateY.value = 0;
      wordOpacity.value = withTiming(1, { duration: 300 });
      wordTranslateY.value = 0;
      const t = setTimeout(goNext, 1200);
      return () => clearTimeout(t);
    }

    // 1. The pin "lands" (0-450ms): drop in with a soft overshoot bounce.
    iconOpacity.value = withTiming(1, { duration: 250 });
    iconScale.value = withTiming(1, { duration: 450, easing: EASE });
    iconTranslateY.value = withSequence(withTiming(4, { duration: 350, easing: EASE }), withTiming(0, { duration: 100, easing: EASE }));

    // 2. Impact ring, right as it touches down (380-760ms).
    ringOpacity.value = withDelay(380, withSequence(withTiming(0.6, { duration: 0 }), withTiming(0, { duration: 380 })));
    ringScale.value = withDelay(380, withTiming(2.4, { duration: 380, easing: Easing.out(Easing.quad) }));

    // 3. The pin's dot pulses once, like a GPS ping (at 420ms).
    dotScale.value = withDelay(420, withSequence(withTiming(1.18, { duration: 150, easing: EASE }), withTiming(1, { duration: 150, easing: EASE })));

    // 4. Wordmark fades/rises in, staggered after the pin (300-800ms).
    wordOpacity.value = withDelay(300, withTiming(1, { duration: 500, easing: EASE }));
    wordTranslateY.value = withDelay(300, withTiming(0, { duration: 500, easing: EASE }));

    // 5. Gentle continuous breathing once the pin has landed — no spinner,
    // the screen just stays alive.
    breathScale.value = withDelay(
      450,
      withRepeat(withSequence(withTiming(1.015, { duration: 900, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })), -1, false)
    );
    haloOpacity.value = withDelay(
      450,
      withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.sin) })), -1, false)
    );

    // 6. Rising fade-out into the app.
    const exitTimer = setTimeout(() => {
      exitScale.value = withTiming(1.04, { duration: EXIT_DURATION_MS, easing: Easing.out(Easing.cubic) });
      exitOpacity.value = withTiming(0, { duration: EXIT_DURATION_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(goNext)();
      });
    }, EXIT_AT_MS);

    return () => clearTimeout(exitTimer);
  }, [ready, reduceMotion]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ translateY: iconTranslateY.value }, { scale: iconScale.value * breathScale.value }],
  }));
  const ringAnimStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value, transform: [{ scale: ringScale.value }] }));
  const dotAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));
  const wordAnimStyle = useAnimatedStyle(() => ({ opacity: wordOpacity.value, transform: [{ translateY: wordTranslateY.value }] }));
  const haloAnimStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));
  const exitAnimStyle = useAnimatedStyle(() => ({ opacity: exitOpacity.value, transform: [{ scale: exitScale.value }] }));

  return (
    <Animated.View style={[styles.wrap, exitAnimStyle]}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Animated.View style={[styles.halo, haloAnimStyle]} pointerEvents="none">
          <Svg width={HALO_SIZE} height={HALO_SIZE}>
            <Defs>
              <SvgRadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.pink} stopOpacity={0.22} />
                <Stop offset="100%" stopColor={colors.pink} stopOpacity={0} />
              </SvgRadialGradient>
            </Defs>
            <Rect x={0} y={0} width={HALO_SIZE} height={HALO_SIZE} fill="url(#halo)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.iconWrap, iconAnimStyle]}>
          <LinearGradient
            colors={[colors.coral, colors.pink, colors.violetDeep, colors.brandBlue, colors.mintDeep]}
            locations={[0, 0.26, 0.54, 0.78, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.iconBox}
          >
            <PinMark size={65} />
          </LinearGradient>
          <Animated.View style={[styles.dotOverlay, dotAnimStyle]} pointerEvents="none" />
          <Animated.View style={[styles.ring, ringAnimStyle]} pointerEvents="none" />
        </Animated.View>

        <Animated.View style={[styles.wordWrap, wordAnimStyle]}>
          <Text color="#fff" style={[HERE_TEXT_STYLE, { fontFamily: displayFont.regular }]}>
            gym
          </Text>
          <MaskedView
            maskElement={
              <Text weight="black" color="#000" style={HERE_TEXT_STYLE}>
                here
              </Text>
            }
          >
            <LinearGradient colors={['#FF6B8B', '#B57BFF', '#5EE6D0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text weight="black" style={[HERE_TEXT_STYLE, { opacity: 0 }]}>
                here
              </Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0E0A16' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: HALO_SIZE, height: HALO_SIZE, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: ICON_BOX, height: ICON_BOX, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: ICON_BOX, height: ICON_BOX, borderRadius: ICON_BOX * 0.26, alignItems: 'center', justifyContent: 'center' },
  dotOverlay: { position: 'absolute', width: 17, height: 17, borderRadius: 9, backgroundColor: colors.pink, left: 43.5, top: 37 },
  ring: { position: 'absolute', bottom: -8, alignSelf: 'center', width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.pink },
  wordWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
});
