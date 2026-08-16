import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import GradientBlock from '../src/components/ui/GradientBlock';
import { PinMark, Wordmark } from '../src/components/ui/Logo';
import { useSession } from '../src/store/session';

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const { hasOnboarded, isCoach, role } = useSession();

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else if (role === 'coach' && isCoach) {
        router.replace('/(coach)/ma-fiche');
      } else {
        router.replace('/(member)/explore');
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <GradientBlock kind="brand" style={styles.wrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <PinMark size={72} />
        <View style={{ height: 18 }} />
        <Wordmark size={28} />
      </Animated.View>
    </GradientBlock>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
