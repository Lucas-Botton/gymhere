import React from 'react';
import { View, Pressable, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Text from './Text';
import Tap from './Tap';
import GradientBlock from './GradientBlock';
import { colors, radius, spacing } from '../../theme';

export function Chip({
  label,
  active,
  onPress,
  hue = colors.pink,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  hue?: string;
}) {
  return (
    <Tap
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: hue, borderColor: hue, shadowColor: hue, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 }
          : { backgroundColor: colors.bgTint2, borderColor: colors.bgTint2 },
      ]}
    >
      <Text weight="extrabold" color={active ? '#fff' : '#6B6478'} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Tap>
  );
}

// Category/descriptive labels carry no color of their own (gymhere color
// logic: a hue only ever means "brand/action" or "status" — everything
// else, including category tags, is neutral ink/grey).
export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

export function EquipBadge({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

export function CertifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' }}>
      <Text weight="black" color="#fff" style={{ fontSize: size * 0.6, lineHeight: size * 0.7 }}>
        ✓
      </Text>
    </View>
  );
}

export function VerifiedPill({ verified }: { verified: boolean }) {
  return (
    <View
      style={[
        styles.pill,
        verified ? { backgroundColor: colors.successBg, borderColor: colors.successBorder } : { backgroundColor: colors.warningBg, borderColor: 'transparent' },
      ]}
    >
      <Text weight="extrabold" color={verified ? colors.successDeep : colors.warning} style={{ fontSize: 10.5 }}>
        {verified ? 'Vérifié ✓' : 'En attente ⏳'}
      </Text>
    </View>
  );
}

export function StatusPill({ status }: { status: 'confirme' | 'en_attente' | 'accepte' | 'refuse' }) {
  const map = {
    confirme: { label: 'Confirmé', bg: colors.successBg, color: colors.successDeep },
    accepte: { label: 'Accepté', bg: colors.successBg, color: colors.successDeep },
    en_attente: { label: 'En attente', bg: colors.warningBg, color: colors.warning },
    refuse: { label: 'Refusé', bg: colors.dangerBg, color: colors.danger },
  } as const;
  const v = map[status];
  return (
    <View style={[styles.pill, { backgroundColor: v.bg, borderColor: 'transparent' }]}>
      <Text weight="extrabold" color={v.color} style={{ fontSize: 10.5 }}>
        {v.label}
      </Text>
    </View>
  );
}

export function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <Text weight="bold" color="#F5A623" style={{ fontSize: size }}>
      {'★'.repeat(Math.round(rating))}
      <Text weight="bold" color={colors.border} style={{ fontSize: size }}>
        {'★'.repeat(5 - Math.round(rating))}
      </Text>
    </Text>
  );
}

// Renders "★ 4.8 · 214 avis Google · 0,4 km" when the gym has a verified
// Google rating, or "Nouveau sur gymhere · 0,4 km" otherwise — never a
// fabricated rating, and always attributed so it's never confused with
// gymhere's own reviews (shown separately, see the gym detail screen).
// Meant to be nested inside a <Text>.
export function GymRatingMeta({ gym, distance, starSize = 11 }: { gym: { googleRating?: number; googleReviews?: number }; distance: string; starSize?: number }) {
  if (gym.googleRating != null) {
    return (
      <>
        <StarRating rating={gym.googleRating} size={starSize} /> {gym.googleRating}
        {gym.googleReviews != null ? ` · ${gym.googleReviews} avis Google` : ''} · {distance}
      </>
    );
  }
  return <>Nouveau sur gymhere · {distance}</>;
}

export function Avatar({ gradient = 'pinkViolet', size = 40, initial, uri }: { gradient?: string; size?: number; initial?: string; uri?: string }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <GradientBlock kind={gradient} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      {initial ? (
        <Text weight="black" color="#fff" style={{ fontSize: size * 0.4 }}>
          {initial}
        </Text>
      ) : null}
    </GradientBlock>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

export function IconCircle({ children, tint, size = 40 }: { children: React.ReactNode; tint: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) {
    return (
      <Tap onPress={onPress} style={[styles.card, style]}>
        {children}
      </Tap>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: colors.bgTint2,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
});
