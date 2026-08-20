import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Text from './Text';
import { displayFont } from '../../theme';

export function PinMark({ size = 64, color = '#fff', dot = '#FF1F6B' }: { size?: number; color?: string; dot?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C7.5 2 4 5.4 4 9.6c0 5.6 6.7 11.4 7.5 12.1a.8.8 0 0 0 1 0C13.3 21 20 15.2 20 9.6 20 5.4 16.5 2 12 2z"
        fill={color}
      />
      <Circle cx="12" cy="9.6" r="3.2" fill={dot} />
    </Svg>
  );
}

export function Wordmark({ size = 22, color = '#fff' }: { size?: number; color?: string }) {
  // "gym" and "here" must share a font family (Gabarito, just a different
  // weight) — mixing in Nunito for "gym" gives the two runs different
  // baseline metrics at the same fontSize, which visibly misaligns them.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text color={color} style={{ fontFamily: displayFont.regular, fontSize: size, letterSpacing: -0.4 }}>
        gym
      </Text>
      <Text weight="black" color={color} style={{ fontSize: size, letterSpacing: -0.4 }}>
        here
      </Text>
    </View>
  );
}
