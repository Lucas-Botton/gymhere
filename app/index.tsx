import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Wordmark } from '../src/components/ui/Logo';
import { useSession } from '../src/store/session';

const BG = '#14101A';

function Spinner() {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />;
}

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const { hasOnboarded, isCoach, role } = useSession();

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const t = setTimeout(() => {
      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else if (role === 'coach' && isCoach) {
        router.replace('/(coach)/ma-fiche');
      } else {
        router.replace('/(member)/explore');
      }
    }, 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <Wordmark size={26} color="#fff" />
        <View style={{ height: 22 }} />
        <Spinner />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 420, height: 420, borderRadius: 210 },
  glowTop: { top: -220, backgroundColor: 'rgba(245,57,127,0.22)' },
  glowBottom: { bottom: -220, backgroundColor: 'rgba(79,110,247,0.18)' },
  spinner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.22)',
    borderTopColor: '#fff',
  },
});
