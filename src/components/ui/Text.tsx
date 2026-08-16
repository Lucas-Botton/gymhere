import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, fontFamily } from '../../theme';

type Weight = 'regular' | 'semibold' | 'bold' | 'extrabold' | 'black';

export default function Text({
  weight = 'semibold',
  color = colors.ink,
  style,
  ...rest
}: TextProps & { weight?: Weight; color?: string }) {
  return <RNText style={[{ fontFamily: fontFamily[weight], color }, style]} {...rest} />;
}
