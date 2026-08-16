import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from './Text';
import { colors, gradients, radius, spacing } from '../../theme';

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
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
        <LinearGradient colors={[colors.pink, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={base}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }
  if (variant === 'dark') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: colors.ink }, style]}>
        {content}
      </Pressable>
    );
  }
  if (variant === 'outline') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border }, style]}>
        {content}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: 'transparent' }, style]}>
      {content}
    </Pressable>
  );
}
