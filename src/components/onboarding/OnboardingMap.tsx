import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, AccessibilityInfo } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
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
  interpolate,
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

function GymPin({ delay, reduceMotion }: { delay: number; reduceMotion: boolean }) {
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    enter.value = withDelay(delay, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
    const haloDelay = delay + 380;
    haloScale.value = withDelay(haloDelay, withRepeat(withSequence(withTiming(1, { duration: 0 }), withTiming(3, { duration: 2400, easing: Easing.out(Easing.ease) })), -1, false));
    haloOpacity.value = withDelay(haloDelay, withRepeat(withSequence(withTiming(0.55, { duration: 0 }), withTiming(0, { duration: 2400, easing: Easing.out(Easing.ease) })), -1, false));
  }, [reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [-14, 0]) }, { scale: interpolate(enter.value, [0, 1], [0.6, 1]) }],
  }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value, transform: [{ scale: haloScale.value }] }));

  return (
    <View style={styles.pinWrap}>
      <Animated.View style={[styles.pinHalo, haloStyle]} pointerEvents="none" />
      <Animated.View style={[styles.pinDot, dotStyle]} />
    </View>
  );
}

function MeOverlay({ reduceMotion }: { reduceMotion: boolean }) {
  const floatY = useSharedValue(0);
  const sectorRotate = useSharedValue(0);
  const sectorOpacity = useSharedValue(reduceMotion ? 0 : 0.45);
  const ring1Scale = useSharedValue(0.3);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.3);
  const ring2Opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    floatY.value = withRepeat(withSequence(withTiming(-4, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(4, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1, true);

    // Radar sector: 1.5 turns, then fades.
    sectorRotate.value = withTiming(540, { duration: 1300, easing: Easing.out(Easing.cubic) });
    sectorOpacity.value = withDelay(1300, withTiming(0, { duration: 400 }));

    // Two concentric pulses, staggered.
    ring1Opacity.value = withSequence(withTiming(0.5, { duration: 0 }), withTiming(0, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    ring1Scale.value = withTiming(3, { duration: 1300, easing: Easing.out(Easing.cubic) });
    ring2Opacity.value = withDelay(350, withSequence(withTiming(0.5, { duration: 0 }), withTiming(0, { duration: 1300, easing: Easing.out(Easing.cubic) })));
    ring2Scale.value = withDelay(350, withTiming(3, { duration: 1300, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }] }));
  const sectorStyle = useAnimatedStyle(() => ({ opacity: sectorOpacity.value, transform: [{ rotate: `${sectorRotate.value}deg` }] }));
  const ring1Style = useAnimatedStyle(() => ({ opacity: ring1Opacity.value, transform: [{ scale: ring1Scale.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ opacity: ring2Opacity.value, transform: [{ scale: ring2Scale.value }] }));

  // Static ~45° wedge, pointed at the center; rotation is a pure transform
  // on the wrapping Animated.View, so nothing here is re-rendered per frame.
  const r = RADAR_SIZE / 2;
  const a1 = ((-112.5) * Math.PI) / 180;
  const a2 = ((-67.5) * Math.PI) / 180;
  const wedgePath = `M ${r} ${r} L ${r + r * Math.cos(a1)} ${r + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${r + r * Math.cos(a2)} ${r + r * Math.sin(a2)} Z`;

  return (
    <View style={styles.meOverlayWrap} pointerEvents="none">
      {!reduceMotion ? (
        <Animated.View style={[styles.radarSector, sectorStyle]}>
          <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
            <Path d={wedgePath} fill={PIN_MINT} fillOpacity={1} />
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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const gymsShown = GYMS.filter((g) => g.priceFrom != null)
    .slice(0, 8)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <View style={styles.mapCard}>
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
      >
        {gymsShown.map((g, i) => (
          <Marker key={g.id} coordinate={{ latitude: g.lat, longitude: g.lng }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={!reduceMotion}>
            <GymPin delay={300 + i * 120} reduceMotion={reduceMotion} />
          </Marker>
        ))}
      </MapView>

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
  pinHalo: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: PIN_MINT },
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
