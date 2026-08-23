import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, AccessibilityInfo, LayoutChangeEvent } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import Glass from '../ui/Glass';
import { GYMS, ME_LOCATION } from '../../data/seed';
import { colors, radius } from '../../theme';

// DESIGN-MAP-ONBOARDING.md, applied to just this card. The brief's
// preferred option (MapLibre / react-native-maps + Google customMapStyle)
// needs a Google Maps API key we don't have and would swap map providers
// app-wide — too risky for a decorative, non-interactive showcase card.
// This is the brief's own fallback (option B): keep the existing native
// map (already muted, already pointerEvents="none", never pans/zooms) and
// deliver the actual visual goal — the duotone brand wash, on-brand pins,
// and a premium "detecting" ambiance — as overlays on top of it.
//
// An earlier version of this ambiance used a rotating radar sector (a
// spinning mint wedge, like a sonar/game HUD) — on reflection that read
// as gadgety rather than premium. Replaced with a soft breathing glow
// around "me" (same technique as the splash screen's halo) plus gentle
// expanding rings — the Uber/Find My/Apple Maps language for "searching
// nearby", not a video-game radar.
const MUTED_MAP_TYPE = Platform.OS === 'ios' ? 'mutedStandard' : 'standard';
const PIN_MINT = '#2FF0D6'; // exact match to the badge's own pulsing dot below

// Compass bearing (0-360, clockwise from north) from "me" to a gym. Only
// used to pick which curated slot (see PIN_SLOTS below) a pin lands in —
// this card is a decorative showcase, not a real map, so exact geographic
// placement isn't the goal; keeping the general direction right is.
function bearingDeg(lat: number, lng: number) {
  const dLat = lat - ME_LOCATION.lat;
  const dLng = lng - ME_LOCATION.lng;
  let deg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

// No gym in the seed data has `priceFrom` (or even `price`) populated —
// filtering on it here silently produced an empty list, which was the
// actual reason nothing ever rendered through four rounds of "fixing" the
// Marker/positioning mechanism instead. The 8 closest gyms is both a
// filter that always yields real pins and the right thing to show here.
const GYMS_SHOWN = [...GYMS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8);

// Curated, evenly-aired layout (fraction of the card's width/height) —
// real Lyon gyms near "me" happen to cluster tightly to one side, which
// reads as lopsided and cramped on a small card. Weighted toward the
// right/center, kept light on the far left (that's west Lyon) and clear
// of the bottom-left counter badge.
const PIN_SLOTS: { x: number; y: number }[] = [
  { x: 0.64, y: 0.13 },
  { x: 0.85, y: 0.27 },
  { x: 0.88, y: 0.55 },
  { x: 0.74, y: 0.78 },
  { x: 0.48, y: 0.87 },
  { x: 0.27, y: 0.72 },
  { x: 0.16, y: 0.40 },
  { x: 0.34, y: 0.17 },
];

// Each pin's drawn slot, matched to a real gym by angular order (both
// measured from the card's center) so a gym roughly east of "me" still
// lands broadly on the right, just spread out nicely rather than bunched
// up. Reveal order/timing is handled separately below, by REVEAL_DELAYS.
const PINS_DATA = (() => {
  const slotsByAngle = PIN_SLOTS.map((s) => {
    const dx = s.x - 0.5;
    const dy = s.y - 0.5;
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (a < 0) a += 360;
    return { slot: s, angle: a };
  }).sort((a, b) => a.angle - b.angle);

  const byBearing = [...GYMS_SHOWN].sort((a, b) => bearingDeg(a.lat, a.lng) - bearingDeg(b.lat, b.lng));

  return byBearing.map((g, i) => ({ id: g.id, slot: slotsByAngle[i % slotsByAngle.length].slot }));
})();

// A simple, hand-tuned stagger — closest real gyms first, the very first
// one almost immediately (so the "finding gyms nearby" idea reads right
// away), the rest trickling in over the following few seconds. Decoupled
// from the ambient glow's own animation entirely; no geometry to keep in
// sync, which is also just simpler.
const REVEAL_DELAYS_MS = [450, 1400, 2100, 2850, 3600, 4400, 5250, 6100];
const REVEAL_ORDER = GYMS_SHOWN.map((g) => g.id); // already distance-sorted

function PulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.9);
  useEffect(() => {
    scale.value = withRepeat(withTiming(2.2, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
  }, []);
  const ringStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.badgeDotRing, ringStyle]} />
      <View style={styles.badgeDotCore} />
    </View>
  );
}

function AnimatedCounter({ target, reduceMotion }: { target: number; reduceMotion: boolean }) {
  const [count, setCount] = useState(reduceMotion ? target : 0);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(300, withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion]);

  useAnimatedReaction(
    () => Math.round(progress.value * target),
    (val, prev) => {
      if (val !== prev) runOnJS(setCount)(val);
    },
    [target]
  );

  return (
    <Text weight="black" color="#fff" style={{ fontSize: 13.5 }}>
      {count}
    </Text>
  );
}

// A plain absolutely-positioned overlay, NOT a react-native-maps Marker —
// custom views rendered as Marker children on this card proved unreliable
// across several attempts (this card's real size isn't settled the
// moment the MapView mounts, unlike a full-screen map). Since positions
// here are curated slots rather than real projected coordinates anyway,
// there's no need for the map's native bridge at all: just an ordinary
// View at a fixed spot, with full, reliable Reanimated support. The pop-in
// itself is deliberately restrained — a soft settle, not a bouncy spring —
// to match the calmer, more premium feel of the glow it's paired with.
function GymPin({ revealed, style }: { revealed: boolean; style: any }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (revealed) progress.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
  }, [revealed]);
  const pinStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + progress.value * 0.3 }],
  }));
  return (
    <Animated.View style={[styles.pinWrap, style, pinStyle]} pointerEvents="none">
      <View style={styles.pinDot} />
    </Animated.View>
  );
}

// A soft radial-gradient glow, not a hard-edged ring — same technique as
// the splash screen's halo (Svg + RadialGradient), reused here so the
// whole app's "premium glow" language stays consistent. Transparent at
// the very center and the outer edge, a soft bright band in between:
// reads as a gentle pulse rather than a sonar ping. Mint, echoing the
// gyms it's "finding" — the small halo right around "me" (below) stays
// pink to match the position dot itself.
const GLOW_SIZE = 220;
function GlowPulse({ style }: { style: any }) {
  return (
    <Animated.View style={[styles.glowWrap, style]} pointerEvents="none">
      <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
        <Defs>
          <SvgRadialGradient id="pulse" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={PIN_MINT} stopOpacity={0} />
            <Stop offset="70%" stopColor={PIN_MINT} stopOpacity={0} />
            <Stop offset="88%" stopColor={PIN_MINT} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={PIN_MINT} stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x={0} y={0} width={GLOW_SIZE} height={GLOW_SIZE} fill="url(#pulse)" />
      </Svg>
    </Animated.View>
  );
}

const HALO_SIZE = 80;
function MeHalo({ style }: { style: any }) {
  return (
    <Animated.View style={[styles.meHaloWrap, style]} pointerEvents="none">
      <Svg width={HALO_SIZE} height={HALO_SIZE}>
        <Defs>
          <SvgRadialGradient id="meHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.pink} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={colors.pink} stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x={0} y={0} width={HALO_SIZE} height={HALO_SIZE} fill="url(#meHalo)" />
      </Svg>
    </Animated.View>
  );
}

function MeOverlay({ reduceMotion }: { reduceMotion: boolean }) {
  const floatY = useSharedValue(0);
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.55);
  const pulse1Scale = useSharedValue(0.4);
  const pulse1Opacity = useSharedValue(0);
  const pulse2Scale = useSharedValue(0.4);
  const pulse2Opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    floatY.value = withRepeat(withSequence(withTiming(-4, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(4, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1, true);

    // A slow, gentle breathing halo right around "me" — always present,
    // never sharp or mechanical.
    haloScale.value = withRepeat(withSequence(withTiming(1.12, { duration: 1900, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) })), -1, false);
    haloOpacity.value = withRepeat(withSequence(withTiming(0.85, { duration: 1900, easing: Easing.inOut(Easing.sin) }), withTiming(0.55, { duration: 1900, easing: Easing.inOut(Easing.sin) })), -1, false);

    // Two slow, soft pulses expanding outward and fading — an ambient
    // "searching nearby" cue, not a directional sweep.
    pulse1Opacity.value = withRepeat(withSequence(withTiming(0.55, { duration: 0 }), withTiming(0, { duration: 2600, easing: Easing.out(Easing.cubic) })), -1, false);
    pulse1Scale.value = withRepeat(withSequence(withTiming(0.4, { duration: 0 }), withTiming(2.3, { duration: 2600, easing: Easing.out(Easing.quad) })), -1, false);
    pulse2Opacity.value = withDelay(1300, withRepeat(withSequence(withTiming(0.55, { duration: 0 }), withTiming(0, { duration: 2600, easing: Easing.out(Easing.cubic) })), -1, false));
    pulse2Scale.value = withDelay(1300, withRepeat(withSequence(withTiming(0.4, { duration: 0 }), withTiming(2.3, { duration: 2600, easing: Easing.out(Easing.quad) })), -1, false));
  }, [reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value, transform: [{ scale: haloScale.value }] }));
  const pulse1Style = useAnimatedStyle(() => ({ opacity: pulse1Opacity.value, transform: [{ scale: pulse1Scale.value }] }));
  const pulse2Style = useAnimatedStyle(() => ({ opacity: pulse2Opacity.value, transform: [{ scale: pulse2Scale.value }] }));

  return (
    <View style={styles.meOverlayWrap} pointerEvents="none">
      {!reduceMotion ? <GlowPulse style={pulse1Style} /> : null}
      {!reduceMotion ? <GlowPulse style={pulse2Style} /> : null}
      {!reduceMotion ? <MeHalo style={haloStyle} /> : null}
      <Animated.View style={[styles.meDotWrap, dotStyle]}>
        <View style={styles.meDotBorder}>
          <GradientBlock kind="coralPink" style={styles.meDotCore} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function OnboardingMap() {
  const [reduceMotion, setReduceMotion] = useState(false);
  // Pin slots are fractions of the card's own size, so the only thing
  // needed to turn them into pixels is the card's measured width/height —
  // a plain onLayout, no map projection or native bridge call involved.
  const [cardSize, setCardSize] = useState<{ w: number; h: number } | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(new Set(PINS_DATA.map((p) => p.id)));
      return;
    }
    const timers = REVEAL_ORDER.map((id, i) => setTimeout(() => setRevealed((prev) => (prev.has(id) ? prev : new Set(prev).add(id))), REVEAL_DELAYS_MS[i % REVEAL_DELAYS_MS.length]));
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCardSize({ w: width, h: height });
  };

  return (
    <View style={styles.mapCard} onLayout={onCardLayout}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        mapType={MUTED_MAP_TYPE as any}
        initialRegion={{ latitude: ME_LOCATION.lat, longitude: ME_LOCATION.lng, latitudeDelta: 0.09, longitudeDelta: 0.09 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      />

      {/* Duotone brand wash, fused with the map underneath. */}
      <LinearGradient
        colors={[colors.pink, '#B41FE0', '#5B4BFF']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.55, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.42 }]}
        pointerEvents="none"
      />
      <LinearGradient colors={['transparent', 'rgba(14,10,22,0.35)']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {cardSize
        ? PINS_DATA.map((p) => {
            const x = p.slot.x * cardSize.w;
            const y = p.slot.y * cardSize.h;
            return <GymPin key={p.id} revealed={revealed.has(p.id)} style={{ position: 'absolute', left: x - 9, top: y - 9 }} />;
          })
        : null}

      <MeOverlay reduceMotion={reduceMotion} />

      <Glass variant="dark" intensity={40} style={styles.mapBadge}>
        <PulseDot />
        <Text weight="bold" color="#fff" style={{ fontSize: 11.5 }}>
          <AnimatedCounter target={GYMS.length} reduceMotion={reduceMotion} /> salles actives
        </Text>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    flex: 1,
    borderRadius: radius.sheet,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeDotRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: PIN_MINT },
  badgeDotCore: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: PIN_MINT },
  pinWrap: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PIN_MINT,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  meOverlayWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  glowWrap: { position: 'absolute', width: GLOW_SIZE, height: GLOW_SIZE, marginLeft: -GLOW_SIZE / 2, marginTop: -GLOW_SIZE / 2, left: '50%', top: '50%' },
  meHaloWrap: { position: 'absolute', width: HALO_SIZE, height: HALO_SIZE, marginLeft: -HALO_SIZE / 2, marginTop: -HALO_SIZE / 2, left: '50%', top: '50%' },
  meDotWrap: { alignItems: 'center', justifyContent: 'center' },
  meDotBorder: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  meDotCore: { width: 14, height: 14, borderRadius: 7 },
  mapBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
});
