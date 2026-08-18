import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import GradientBlock from '../src/components/ui/GradientBlock';
import { PinMark, Wordmark } from '../src/components/ui/Logo';
import { useSession } from '../src/store/session';

function Spinner() {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 850, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />;
}

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;
  const { hasOnboarded, isCoach, role } = useSession();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
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
    <GradientBlock kind="brand" style={styles.wrap} start={{ x: 0.1, y: 0 }} end={{ x: 0.95, y: 1 }}>
      <Animated.View style={{ opacity, alignItems: 'center', transform: [{ translateY: rise }] }}>
        <View style={styles.pinShadowWrap}>
          <PinMark size={60} />
        </View>
        <View style={{ height: 16 }} />
        <Wordmark size={25} />
        <View style={{ height: 30 }} />
        <Spinner />
      </Animated.View>
    </GradientBlock>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pinShadowWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.28)',
    borderTopColor: '#fff',
  },
});
