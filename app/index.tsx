import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import GradientBlock from '../src/components/ui/GradientBlock';
import { Wordmark } from '../src/components/ui/Logo';
import { IconLocationPin } from '../src/components/ui/icons';
import { colors, radius } from '../src/theme';
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
    <View style={styles.wrap}>
      <View style={styles.haloOuter} />
      <View style={styles.haloInner} />
      <Animated.View style={{ opacity, alignItems: 'center', transform: [{ translateY: rise }] }}>
        <GradientBlock kind="pinkViolet" style={styles.iconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <IconLocationPin size={38} color="#fff" filled={false} />
        </GradientBlock>
        <View style={{ height: 22 }} />
        <Wordmark size={25} />
        <View style={{ height: 32 }} />
        <Spinner />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#150C1D' },
  haloOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.violet,
    opacity: 0.16,
  },
  haloInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.pink,
    opacity: 0.22,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.pink,
    shadowOpacity: 0.55,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
  },
});
