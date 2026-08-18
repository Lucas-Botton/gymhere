import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { PinMark } from '../src/components/ui/Logo';
import Text from '../src/components/ui/Text';
import { colors } from '../src/theme';
import { useSession } from '../src/store/session';

// Ported 1:1 from the mockup source (Jimmy.dc.html, the real splash markup,
// not an approximation from a screenshot): #14101a background, two soft
// color washes, a 92x92 gradient icon badge, and a gradient-filled "here".
function Spinner() {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />;
}

const HERE_TEXT_STYLE = { fontSize: 27, letterSpacing: -1.2 };

export default function Splash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;
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
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.iconWrap, { opacity, transform: [{ translateY: rise }] }]}>
        <LinearGradient
          colors={[colors.coral, colors.pink, colors.violetDeep, colors.brandBlue, colors.mintDeep]}
          locations={[0, 0.26, 0.54, 0.78, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.iconBox}
        >
          <PinMark size={57} />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.bottomWrap, { opacity, transform: [{ translateY: rise }] }]}>
        <View style={{ flexDirection: 'row' }}>
          <Text weight="regular" color="#fff" style={HERE_TEXT_STYLE}>
            gym
          </Text>
          <MaskedView maskElement={<Text weight="black" color="#000" style={HERE_TEXT_STYLE}>here</Text>}>
            <LinearGradient colors={['#FF6B8B', '#B57BFF', '#5EE6D0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text weight="black" style={[HERE_TEXT_STYLE, { opacity: 0 }]}>
                here
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <Spinner />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#14101a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconWrap: {
    shadowColor: colors.pink,
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  iconBox: { width: 92, height: 92, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  bottomWrap: { position: 'absolute', left: 0, right: 0, bottom: 56, alignItems: 'center', gap: 14 },
  spinner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
  },
});
