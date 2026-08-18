import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

// Scale-down tap feedback used across the whole app (mirrors the mockup's
// global .jm-tap:active{transform:scale(.975)} touch feedback).
//
// `style` (size/margin/background/border/padding) lives on the Pressable so
// the element still participates correctly in a parent flex row (e.g.
// two flex:1 buttons side by side). Only the child-arranging properties
// (flexDirection/alignItems/justifyContent/gap) are mirrored onto the inner
// animated layer, since its children (icon + label, etc.) need them to lay
// out the same way they did before this wrapper existed.
export default function Tap({
  children,
  style,
  scaleTo = 0.965,
  ...rest
}: PressableProps & { children: React.ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;

  const pressIn = () => {
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} style={style} {...rest}>
      <Animated.View
        style={{
          flex: 1,
          flexDirection: flat.flexDirection,
          alignItems: flat.alignItems,
          justifyContent: flat.justifyContent,
          gap: flat.gap as number | undefined,
          transform: [{ scale }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
