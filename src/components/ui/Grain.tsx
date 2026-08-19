import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Pattern, Circle, Rect } from 'react-native-svg';

// Lightweight stand-in for the mockup's feTurbulence grain overlay
// (DESIGN-V2-SPECS.md §5) — a tiled scatter of tiny dots at low opacity,
// laid over gradient surfaces for texture. Built with react-native-svg
// (already a dependency for the icon set) instead of a bundled noise
// image, so it costs nothing extra and never needs re-exporting at a
// different size.
const DOTS = Array.from({ length: 48 }, (_, i) => {
  const seed = i * 137.5;
  return {
    x: seed % 100,
    y: (seed * 1.618) % 100,
    r: 0.4 + (i % 5) * 0.15,
    o: 0.14 + (i % 4) * 0.07,
  };
});

// `style` lets a caller on a rounded surface (borderRadius, overflow:hidden)
// clip the overlay to match — otherwise the tiled rect can peek past
// rounded corners the same way an un-clipped shadow does.
export default function Grain({ opacity = 0.35, style }: { opacity?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg style={[StyleSheet.absoluteFill, { opacity }]} width="100%" height="100%">
        <Pattern id="grain" width={100} height={100} patternUnits="userSpaceOnUse">
          {DOTS.map((d, i) => (
            <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />
          ))}
        </Pattern>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grain)" />
      </Svg>
    </View>
  );
}
