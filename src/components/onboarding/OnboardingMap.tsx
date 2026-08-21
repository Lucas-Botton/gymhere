import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, AccessibilityInfo } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
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
// and the radar entrance — as overlays on top of it.
const MUTED_MAP_TYPE = Platform.OS === 'ios' ? 'mutedStandard' : 'standard';
const PIN_MINT = '#2FF0D6'; // exact match to the badge's own pulsing dot below
const RADAR_SIZE = 340;
const LAP_MS = 3800; // one full, unhurried sweep — a slow authoritative radar, not a frantic one
const REVEAL_LAPS = 3; // pins are found in 3 waves (closest first), not all at once

// Compass bearing (0-360, clockwise from north) from "me" to a gym. The
// map never rotates (rotateEnabled=false, north stays up), so a plain
// planar approximation is directionally accurate enough for this
// decorative card — no need for real geodesic math over a few km of Lyon.
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

// Precomputed once: each pin's id/coords/bearing (to sync with the sweep)
// and which of the 3 reveal waves it belongs to, nearest gyms first
// (GYMS_SHOWN is already distance-sorted).
const PINS_DATA = (() => {
  const groupSize = Math.max(1, Math.ceil(GYMS_SHOWN.length / REVEAL_LAPS));
  return GYMS_SHOWN.map((g, i) => ({
    id: g.id,
    lat: g.lat,
    lng: g.lng,
    bearing: bearingDeg(g.lat, g.lng),
    revealLap: Math.floor(i / groupSize),
  }));
})();

// The sweep's soft "comet tail": instead of one flat wedge, several thin
// slices with opacity ramping from ~0 (trailing edge) to ~0.5 (leading
// edge, in the rotation's direction of travel). Pure static geometry —
// precomputed once, the only thing that ever animates is the wrapping
// view's `rotate` transform.
const RADAR_SLICES = 8;
const SLICE_SPAN = 42 / RADAR_SLICES;
const SLICE_PATHS = (() => {
  const r = RADAR_SIZE / 2;
  const paths: { d: string; opacity: number }[] = [];
  for (let i = 0; i < RADAR_SLICES; i++) {
    const startDeg = -111 + i * SLICE_SPAN;
    const endDeg = startDeg + SLICE_SPAN + 0.5; // slight overlap hides seams
    const a1 = (startDeg * Math.PI) / 180;
    const a2 = (endDeg * Math.PI) / 180;
    const d = `M ${r} ${r} L ${r + r * Math.cos(a1)} ${r + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${r + r * Math.cos(a2)} ${r + r * Math.sin(a2)} Z`;
    paths.push({ d, opacity: ((i + 1) / RADAR_SLICES) * 0.5 });
  }
  return paths;
})();

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

// A plain absolutely-positioned overlay, NOT a react-native-maps Marker.
// Across three separate attempts, custom views rendered as Marker children
// on this card proved unreliable — invisible on mount, or visible but
// never picked up further style updates — almost certainly because this
// card's real size isn't settled the moment the MapView mounts (unlike a
// full-screen map). Since this card never pans or zooms, each pin's pixel
// position can just be computed once (via `pointForCoordinate`, see
// below) and the pin rendered as an ordinary View at that fixed spot —
// completely sidestepping the Marker snapshot mechanism, with full,
// reliable Reanimated support.
function GymPin({ revealed, style }: { revealed: boolean; style: any }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (revealed) progress.value = withSpring(1, { damping: 14, stiffness: 160 });
  }, [revealed]);
  const pinStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.35 + progress.value * 0.65 }],
  }));
  return (
    <Animated.View style={[styles.pinWrap, style, pinStyle]} pointerEvents="none">
      <View style={styles.pinDot} />
    </Animated.View>
  );
}

function MeOverlay({
  reduceMotion,
  onReveal,
}: {
  reduceMotion: boolean;
  onReveal: (id: string) => void;
}) {
  const floatY = useSharedValue(0);
  const sectorRotate = useSharedValue(0);
  const sectorOpacity = useSharedValue(0);
  const lap = useSharedValue(0);
  const ring1Scale = useSharedValue(0.3);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.3);
  const ring2Opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    floatY.value = withRepeat(withSequence(withTiming(-4, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(4, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1, true);

    // Radar sector: fades in once, then sweeps forever at a constant,
    // unhurried angular speed. A decelerating easing here reads as "spins
    // fast then freezes" — a sweep needs even speed, so this stays linear.
    sectorOpacity.value = withTiming(1, { duration: 400 });
    sectorRotate.value = withRepeat(withTiming(360, { duration: LAP_MS, easing: Easing.linear }), -1, false);

    // Two concentric pulses around "me", looping.
    ring1Opacity.value = withRepeat(withSequence(withTiming(0.5, { duration: 0 }), withTiming(0, { duration: 1300, easing: Easing.out(Easing.cubic) })), -1, false);
    ring1Scale.value = withRepeat(withSequence(withTiming(0.3, { duration: 0 }), withTiming(3, { duration: 1300, easing: Easing.out(Easing.cubic) })), -1, false);
    ring2Opacity.value = withDelay(650, withRepeat(withSequence(withTiming(0.5, { duration: 0 }), withTiming(0, { duration: 1300, easing: Easing.out(Easing.cubic) })), -1, false));
    ring2Scale.value = withDelay(650, withRepeat(withSequence(withTiming(0.3, { duration: 0 }), withTiming(3, { duration: 1300, easing: Easing.out(Easing.cubic) })), -1, false));
  }, [reduceMotion]);

  // Every time the sweep crosses a pin's bearing, during that pin's
  // assigned wave (closest gyms found on lap 0, then further out), reveal
  // it. `sectorRotate` resets 0→360 each lap (a seamless-looking loop:
  // 360deg and 0deg render identically), so a drop in value means a new
  // lap just started.
  useAnimatedReaction(
    () => sectorRotate.value,
    (val, prev) => {
      if (prev === null) return;
      if (val < prev) lap.value += 1;
      for (let i = 0; i < PINS_DATA.length; i++) {
        const p = PINS_DATA[i];
        if (p.revealLap === lap.value && prev < p.bearing && val >= p.bearing) {
          runOnJS(onReveal)(p.id);
        }
      }
    },
    []
  );

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));
  const sectorStyle = useAnimatedStyle(() => ({ opacity: sectorOpacity.value, transform: [{ rotate: `${sectorRotate.value}deg` }] }));
  const ring1Style = useAnimatedStyle(() => ({ opacity: ring1Opacity.value, transform: [{ scale: ring1Scale.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ opacity: ring2Opacity.value, transform: [{ scale: ring2Scale.value }] }));

  return (
    <View style={styles.meOverlayWrap} pointerEvents="none">
      {!reduceMotion ? (
        <Animated.View style={[styles.radarSector, sectorStyle]}>
          <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
            {SLICE_PATHS.map((s, i) => (
              <Path key={i} d={s.d} fill={PIN_MINT} fillOpacity={s.opacity} />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
      {!reduceMotion ? <Animated.View style={[styles.meRing, ring1Style]} /> : null}
      {!reduceMotion ? <Animated.View style={[styles.meRing, ring2Style]} /> : null}
      <Animated.View style={[styles.meDotWrap, dotStyle]}>
        <View style={styles.meDotBorder}>
          <GradientBlock kind="coralPink" style={styles.meDotCore} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function OnboardingMap() {
  const mapRef = useRef<MapView>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Gym pins are plain overlay Views (see GymPin above), positioned once
  // this resolves. `pointForCoordinate` needs the MapView to already have
  // its final on-screen size, so it's called after onMapReady plus a
  // short buffer — the same margin of safety the rest of this card's
  // layout-timing fixes have used.
  const [pinPos, setPinPos] = useState<Record<string, { x: number; y: number }> | null>(null);
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
    if (reduceMotion) setRevealed(new Set(PINS_DATA.map((p) => p.id)));
  }, [reduceMotion]);

  const revealPin = (id: string) => {
    setRevealed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const onMapReady = () => {
    setTimeout(async () => {
      const map = mapRef.current;
      if (!map) return;
      try {
        const entries = await Promise.all(
          PINS_DATA.map(async (p) => {
            const pt = await map.pointForCoordinate({ latitude: p.lat, longitude: p.lng });
            return [p.id, pt] as const;
          })
        );
        setPinPos(Object.fromEntries(entries));
      } catch {
        // Decorative card — if the native bridge isn't ready yet, pins
        // simply stay hidden rather than crashing anything.
      }
    }, 250);
  };

  return (
    <View style={styles.mapCard}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        mapType={MUTED_MAP_TYPE as any}
        initialRegion={{ latitude: ME_LOCATION.lat, longitude: ME_LOCATION.lng, latitudeDelta: 0.09, longitudeDelta: 0.09 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        onMapReady={onMapReady}
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

      {pinPos
        ? PINS_DATA.map((p) => {
            const pos = pinPos[p.id];
            if (!pos) return null;
            return <GymPin key={p.id} revealed={revealed.has(p.id)} style={{ position: 'absolute', left: pos.x - 9, top: pos.y - 9 }} />;
          })
        : null}

      <MeOverlay reduceMotion={reduceMotion} onReveal={revealPin} />

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
  radarSector: { position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE, marginLeft: -RADAR_SIZE / 2, marginTop: -RADAR_SIZE / 2, left: '50%', top: '50%' },
  meRing: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.pink },
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
