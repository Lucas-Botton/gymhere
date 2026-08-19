import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Text from '../ui/Text';
import Tap from '../ui/Tap';
import Glass from '../ui/Glass';
import GradientBlock, { GradientKey } from '../ui/GradientBlock';
import { CertifiedBadge, GymRatingMeta, Tag } from '../ui/primitives';
import { IconHeart } from '../ui/icons';
import { colors, radius, shadow, spacing } from '../../theme';
import { Gym } from '../../types';
import { useApp } from '../../store/app';
import { distanceLabel } from '../../lib/filters';
import { useGymDistanceKm } from '../../lib/useGymDistance';

function HeartButton({ id, small }: { id: string; small?: boolean }) {
  const isFav = useApp((s) => s.favGyms.includes(id));
  const toggle = useApp((s) => s.toggleFavGym);
  const size = small ? 30 : 34;
  return (
    <Tap
      onPress={(e: any) => {
        e.stopPropagation();
        toggle(id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      scaleTo={0.75}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      hitSlop={8}
    >
      <Glass variant="dark" style={[styles.heartGlass, { width: size, height: size, borderRadius: size / 2 }]}>
        <IconHeart size={small ? 15 : 17} color={isFav ? colors.pink : '#fff'} filled={isFav} />
      </Glass>
    </Tap>
  );
}

export function GymCardFeatured({ gym }: { gym: Gym }) {
  const distanceKm = useGymDistanceKm(gym);
  return (
    <View style={styles.featuredSlot}>
      <Tap onPress={() => router.push(`/gym/${gym.id}`)} style={[styles.featuredOuter, shadow.card]}>
        <View style={styles.featuredWrap}>
          <GradientBlock kind={gym.photo as GradientKey} style={styles.featuredPhoto}>
            {gym.sponsored ? (
              <View style={styles.sponsoredTag}>
                <Text weight="black" color="#fff" style={{ fontSize: 10 }}>
                  SPONSORISÉ
                </Text>
              </View>
            ) : null}
            <View style={styles.heartPos}>
              <HeartButton id={gym.id} />
            </View>
          </GradientBlock>
          <View style={styles.featuredBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text weight="black" style={{ fontSize: 16.5, flexShrink: 1 }} numberOfLines={1}>
                {gym.name}
              </Text>
              {gym.certified ? <CertifiedBadge /> : null}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 3 }}>
              <GymRatingMeta gym={gym} distance={distanceLabel(distanceKm)} />
            </Text>
            <View style={styles.tagsRow}>
              {gym.tags.slice(0, 3).map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: spacing.sm }}>
              {gym.priceFrom != null ? (
                <>
                  dès <Text weight="black" color={colors.ink} style={{ fontSize: 21 }}>{gym.priceFrom}€</Text>/mois
                </>
              ) : (
                'Tarifs sur place'
              )}
            </Text>
          </View>
        </View>
      </Tap>
    </View>
  );
}

export function GymCardCompact({ gym }: { gym: Gym }) {
  const distanceKm = useGymDistanceKm(gym);
  return (
    <Tap onPress={() => router.push(`/gym/${gym.id}`)} style={[styles.compactWrap, shadow.soft]}>
      <GradientBlock kind={gym.photo as GradientKey} style={styles.compactPhoto}>
        <HeartButton id={gym.id} small />
      </GradientBlock>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text weight="black" style={{ fontSize: 14.5, flexShrink: 1 }} numberOfLines={1}>
            {gym.name}
          </Text>
          {gym.certified ? <CertifiedBadge size={13} /> : null}
        </View>
        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }} numberOfLines={1}>
          <GymRatingMeta gym={gym} distance={distanceLabel(distanceKm)} />
        </Text>
        <View style={[styles.tagsRow, { marginTop: 4 }]}>
          {gym.tags.slice(0, 2).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>
      <Text weight="black" color={gym.priceFrom != null ? colors.ink : colors.textLight} style={{ fontSize: gym.priceFrom != null ? 19 : 10.5 }}>
        {gym.priceFrom != null ? `${gym.priceFrom}€` : 'Sur place'}
      </Text>
    </Tap>
  );
}

const styles = StyleSheet.create({
  featuredSlot: { width: 250, marginRight: spacing.md },
  featuredOuter: { borderRadius: radius.xl, backgroundColor: '#fff' },
  featuredWrap: { borderRadius: radius.xl, backgroundColor: '#fff', overflow: 'hidden' },
  featuredPhoto: { height: 130, padding: spacing.sm },
  featuredBody: { padding: spacing.md },
  compactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  compactPhoto: { width: 88, height: 88, borderRadius: radius.md, alignItems: 'flex-end', padding: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  heartGlass: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartPos: { position: 'absolute', bottom: spacing.sm, right: spacing.sm },
  sponsoredTag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.blue,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});
