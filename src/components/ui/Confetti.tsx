import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

// Non-blocking micro-celebration (DESIGN-V2-SPECS.md §6.4): a short burst
// of brand-colored pieces radiating from center and fading out over ~1.1s.
// Pure Animated, no confetti library — kept intentionally small so it never
// gets in the way of the confirmation content it sits on top of.
const PALETTE = [colors.pink, colors.violet, colors.blue, colors.mint, colors.lime];
const COUNT = 18;

function Piece({ index }: { index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const angle = (index / COUNT) * Math.PI * 2;
  const distance = 70 + (index % 4) * 24;
  const color = PALETTE[index % PALETTE.length];
  const size = 6 + (index % 3) * 2;
  const spin = (index % 2 === 0 ? 1 : -1) * (180 + index * 15);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance + 30] });
  const opacity = progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: '50%',
        top: '38%',
        width: size,
        height: size * 1.6,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

export default function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}
