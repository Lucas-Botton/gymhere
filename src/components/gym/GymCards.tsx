import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Text from '../ui/Text';
import Tap from '../ui/Tap';
import Glass from '../ui/Glass';
import GradientBlock, { GradientKey } from '../ui/GradientBlock';
import { CertifiedBadge, StarRating, Tag } from '../ui/primitives';
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
      {gym.sponsored ? (
        <>
          <View pointerEvents="none" style={[styles.glowLayer, { top: -16, left: -16, right: -16, bottom: -16, borderRadius: radius.xl + 16, opacity: 0.07 }]} />
          <View pointerEvents="none" style={[styles.glowLayer, { top: -9, left: -9, right: -9, bottom: -9, borderRadius: radius.xl + 9, opacity: 0.13 }]} />
          <View pointerEvents="none" style={[styles.glowLayer, { top: -4, left: -4, right: -4, bottom: -4, borderRadius: radius.xl + 4, opacity: 0.2 }]} />
        </>
      ) : null}
      <Tap onPress={() => router.push(`/gym/${gym.id}`)} style={[styles.featuredOuter, !gym.sponsored && shadow.card]}>
        <View style={styles.featuredWrap}>
          <GradientBlock kind={gym.photo as GradientKey} style={styles.featuredPhoto}>
            <HeartButton id={gym.id} />
            {gym.sponsored ? (
              <Glass variant="dark" style={styles.sponsoredTag}>
                <Text weight="black" color="#fff" style={{ fontSize: 10.5 }}>
                  MIS EN AVANT
                </Text>
              </Glass>
            ) : null}
          </GradientBlock>
          <View style={styles.featuredBody}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text weight="black" style={{ fontSize: 16.5, flexShrink: 1 }} numberOfLines={1}>
                {gym.name}
              </Text>
              {gym.certified ? <CertifiedBadge /> : null}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 3 }}>
              <StarRating rating={gym.rating} size={11} /> {gym.rating} · {gym.reviews} avis · {distanceLabel(distanceKm)}
            </Text>
            <View style={styles.tagsRow}>
              {gym.tags.slice(0, 3).map((t) => (
                <Tag key={t} label={t} />
              ))}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: spacing.sm }}>
              dès <Text weight="black" color={colors.ink} style={{ fontSize: 16 }}>{gym.priceFrom}€</Text>/mois
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
          ★ {gym.rating} · {gym.reviews} avis · {distanceLabel(distanceKm)}
        </Text>
        <View style={[styles.tagsRow, { marginTop: 4 }]}>
          {gym.tags.slice(0, 2).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>
      <Text weight="black" color={colors.ink} style={{ fontSize: 14.5 }}>
        {gym.priceFrom}€
      </Text>
    </Tap>
  );
}

const styles = StyleSheet.create({
  featuredSlot: { width: 250, marginRight: spacing.md },
  featuredOuter: { borderRadius: radius.xl, backgroundColor: '#fff' },
  glowLayer: { position: 'absolute', backgroundColor: colors.pink },
  featuredWrap: { borderRadius: radius.xl, backgroundColor: '#fff', overflow: 'hidden' },
  featuredPhoto: { height: 130, padding: spacing.sm, alignItems: 'flex-end' },
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
  compactPhoto: { width: 68, height: 68, borderRadius: radius.md, alignItems: 'flex-end', padding: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  heartGlass: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsoredTag: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
