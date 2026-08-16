import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../theme';

export type GradientKey = 'pinkViolet' | 'violetBlue' | 'blueMint' | 'coralPink' | 'brand';

const MAP: Record<GradientKey, { colors: readonly [string, string, ...string[]]; locations?: readonly number[] }> = {
  pinkViolet: { colors: gradients.pinkViolet },
  violetBlue: { colors: gradients.violetBlue },
  blueMint: { colors: gradients.blueMint },
  coralPink: { colors: gradients.coralPink },
  brand: { colors: gradients.brand, locations: gradients.brandLocations },
};

export default function GradientBlock({
  kind,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: {
  kind: GradientKey | string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}) {
  const def = MAP[kind as GradientKey] ?? MAP.pinkViolet;
  return (
    <LinearGradient colors={def.colors} locations={def.locations as any} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}
