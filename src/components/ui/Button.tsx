import React from 'react';
import { ActivityIndicator, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Tap from './Tap';
import Text from './Text';
import { colors, radius, shadow, spacing } from '../../theme';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost';
type Size = 'md' | 'lg' | 'sm';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}) {
  const height = size === 'lg' ? 56 : size === 'sm' ? 40 : 50;
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 15;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.pink : '#fff'} />
      ) : (
        <>
          {icon}
          <Text weight="black" color={variant === 'outline' || variant === 'ghost' ? colors.ink : '#fff'} style={{ fontSize }}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  const base: ViewStyle = {
    height,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.xl,
    opacity: disabled ? 0.5 : 1,
  };

  if (variant === 'primary') {
    const press = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress?.();
    };
    return (
      <Tap onPress={press} disabled={disabled || loading} style={style}>
        <LinearGradient
          colors={['#FF3D7F', '#FF1F6B', '#C81FFF']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[base, shadow.glowPink]}
        >
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 1, right: 1, height: 1, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          {content}
        </LinearGradient>
      </Tap>
    );
  }
  if (variant === 'dark') {
    return (
      <Tap onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: colors.ink }, style]}>
        {content}
      </Tap>
    );
  }
  if (variant === 'outline') {
    return (
      <Tap onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border }, shadow.soft, style]}>
        {content}
      </Tap>
    );
  }
  return (
    <Tap onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: 'transparent' }, style]}>
      {content}
    </Tap>
  );
}
