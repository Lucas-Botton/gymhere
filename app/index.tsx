import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import GradientBlock from '../src/components/ui/GradientBlock';
import { PinMark, Wordmark } from '../src/components/ui/Logo';
import { useSession } from '../src/store/session';

const { width: SCREEN_W } = Dimensions.get('window');

function Dot({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 340, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 340, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.6, duration: 340, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 340, useNativeDriver: true }),
        ]),
        Animated.delay(600 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.dot, { transform: [{ scale }], opacity }]} />;
}

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const { hasOnboarded, isCoach, role } = useSession();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
    const t = setTimeout(() => {
      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else if (role === 'coach' && isCoach) {
        router.replace('/(coach)/ma-fiche');
      } else {
        router.replace('/(member)/explore');
      }
    }, 1350);
    return () => clearTimeout(t);
  }, []);

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_W, SCREEN_W] });

  return (
    <GradientBlock kind="brand" style={styles.wrap} start={{ x: 0.1, y: 0 }} end={{ x: 0.95, y: 1 }}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { rotate: '18deg' }] }]} />
      <Animated.View style={{ opacity, alignItems: 'center', transform: [{ translateY: rise }] }}>
        <View style={styles.pinShadowWrap}>
          <PinMark size={64} />
        </View>
        <View style={{ height: 16 }} />
        <Wordmark size={26} />
        <View style={{ height: 26 }} />
        <View style={styles.dots}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </Animated.View>
    </GradientBlock>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  shimmer: {
    position: 'absolute',
    top: -100,
    width: 160,
    height: 900,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  pinShadowWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
