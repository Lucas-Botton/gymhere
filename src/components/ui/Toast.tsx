import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useApp } from '../../store/app';
import Text from './Text';
import { colors, radius, shadow } from '../../theme';

export default function Toast() {
  const toast = useApp((s) => s.toast);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: toast ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [toast]);

  if (!toast) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, shadow.card, { opacity }]}>
      <Text weight="extrabold" color="#fff" style={{ fontSize: 13 }}>
        {toast}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    zIndex: 999,
  },
});
