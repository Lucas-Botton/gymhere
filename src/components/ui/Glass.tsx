import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

// Frosted-glass surface matching the mockup's recipe: backdrop blur(4-6px)
// plus a translucent tint layered on top. Used for buttons/badges that float
// over photos or the brand gradient (header icons, heart button, map card
// close button, etc).
type Variant = 'light' | 'dark';

const TINT: Record<Variant, string> = {
  light: 'rgba(255,255,255,0.18)',
  dark: 'rgba(20,16,26,0.5)',
};

export default function Glass({
  children,
  style,
  variant = 'light',
  intensity = 28,
  tintColor,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: Variant;
  intensity?: number;
  tintColor?: string;
}) {
  return (
    <BlurView intensity={intensity} tint={variant} experimentalBlurMethod="dimezisBlurView" style={[styles.base, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor ?? TINT[variant] }]} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
