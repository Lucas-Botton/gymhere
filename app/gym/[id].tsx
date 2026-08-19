import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import Tap from '../../src/components/ui/Tap';
import Button from '../../src/components/ui/Button';
import GradientBlock from '../../src/components/ui/GradientBlock';
import Glass from '../../src/components/ui/Glass';
import Grain from '../../src/components/ui/Grain';
import { CertifiedBadge, GymRatingMeta, Avatar } from '../../src/components/ui/primitives';
import { IconBack, IconHeart, IconShare } from '../../src/components/ui/icons';
import EquipmentTabs from '../../src/components/gym/EquipmentTabs';
import ShareSheet from '../../src/components/ui/ShareSheet';
import BottomSheet from '../../src/components/ui/BottomSheet';
import { colors, radius, shadow, shadowBleed, spacing } from '../../src/theme';
import { findGym, COACHES } from '../../src/data/seed';
import { useApp } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import { useBookingSheet } from '../../src/store/booking';
import { useReportSheet } from '../../src/store/report';
import { distanceLabel, gymDistanceKm } from '../../src/lib/filters';
import { useLocationStore } from '../../src/store/location';
import { bookingActionVerb } from '../../src/lib/booking-config';
import { Review } from '../../src/types';

export default function GymDetail() {
  const { id, group } = useLocalSearchParams<{ id: string; group?: string }>();
  const gym = findGym(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const allReviews = useApp((s) => s.reviews);
  const isFav = useApp((s) => (gym ? s.favGyms.includes(gym.id) : false));
  const toggleFav = useApp((s) => s.toggleFavGym);
  const { requireAuth } = useSession();
  const openBooking = useBookingSheet((s) => s.openSheet);
  const openReport = useReportSheet((s) => s.openSheet);
  const coords = useLocationStore((s) => s.coords);

  if (!gym) {
    return (
      <SafeAreaView style={styles.center}>
        <Text weight="bold">Salle introuvable.</Text>
      </SafeAreaView>
    );
  }

  const distanceKm = gymDistanceKm(gym, coords);
  const nativeReviews = allReviews.filter((r) => r.targetType === 'gym' && r.targetId === gym.id);
  const nativeAvg = nativeReviews.reduce((sum, r) => sum + r.stars, 0) / (nativeReviews.length || 1);

  const book = (kind: 'essai' | 'inscription') => {
    const verb = bookingActionVerb(kind);
    requireAuth(`${verb} ${gym.name}`, () =>
      openBooking({ kind, targetType: 'gym', targetId: gym.id, targetName: gym.name, mode: kind === 'essai' ? 'slot' : 'request' })
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView bounces={false}>
        <GradientBlock kind={gym.photo as any} style={styles.hero}>
          <Grain />
          <SafeAreaView edges={['top']} style={styles.heroTop}>
            <Tap onPress={() => router.back()} style={styles.roundBtnWrap}>
              <Glass variant="dark" style={styles.roundBtn}>
                <IconBack size={18} color="#fff" />
              </Glass>
            </Tap>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Tap onPress={() => setShareOpen(true)} style={styles.roundBtnWrap}>
                <Glass variant="dark" style={styles.roundBtn}>
                  <IconShare size={16} color="#fff" />
                </Glass>
              </Tap>
              <Tap onPress={() => toggleFav(gym.id)} scaleTo={0.8} style={styles.roundBtnWrap}>
                <Glass variant="dark" style={styles.roundBtn}>
                  <IconHeart size={16} color="#fff" filled={isFav} />
                </Glass>
              </Tap>
            </View>
          </SafeAreaView>
          {gym.certified ? (
            <Glass variant="dark" style={styles.certifiedTag}>
              <CertifiedBadge size={14} />
              <Text weight="extrabold" color="#fff" style={{ fontSize: 11.5 }}>
                Certifié gymhere
              </Text>
            </Glass>
          ) : null}
        </GradientBlock>

        <View style={styles.body}>
          <Text weight="black" style={{ fontSize: 22 }}>
            {gym.name}
          </Text>
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
            <GymRatingMeta gym={gym} distance={distanceLabel(distanceKm)} starSize={12} />
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg }}>
            <Text weight="extrabold" style={{ fontSize: 13, marginRight: spacing.md, alignSelf: 'center' }}>
              En images
            </Text>
            {gym.gallery.map((g, i) => (
              <GradientBlock key={i} kind={g as any} style={styles.galleryThumb} />
            ))}
            <Pressable onPress={() => router.push(`/immersive/${gym.id}`)} style={styles.immersiveBtn}>
              <Text weight="extrabold" color="#fff" style={{ fontSize: 11, textAlign: 'center' }}>
                Visite{'\n'}360°
              </Text>
            </Pressable>
          </ScrollView>

          <View style={styles.infoCard}>
            <InfoRow label="Adresse" value={gym.address} />
            <InfoRow label="Horaires" value={gym.hours} valueColor={gym.hoursColor} sub={gym.hoursSub} />
            {gym.phone ? (
              <InfoRow label="Téléphone" value={gym.phone} onPress={() => Linking.openURL(`tel:${gym.phone!.replace(/\s/g, '')}`)} />
            ) : null}
            {gym.website ? (
              <InfoRow label="Site web" value={gym.website.replace(/^https?:\/\//, '')} onPress={() => Linking.openURL(gym.website!)} />
            ) : null}
            <InfoRow label="Distance" value={distanceLabel(distanceKm)} last />
          </View>

          <SectionTitle>Formules & prix</SectionTitle>
          {gym.formulas.length > 0 ? (
            gym.formulas.map((f) => (
              <View key={f.name} style={[styles.formula, f.highlight && { borderColor: colors.pink }]}>
                <View style={{ flex: 1 }}>
                  <Text weight="extrabold" style={{ fontSize: 14 }}>
                    {f.name}
                  </Text>
                  <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12 }}>
                    {f.sub}
                  </Text>
                </View>
                <Text weight="black" color={f.highlight ? colors.pink : colors.ink} style={{ fontSize: 14.5 }}>
                  {f.price}
                </Text>
              </View>
            ))
          ) : (
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, lineHeight: 19 }}>
              Tarifs non communiqués publiquement — contacte la salle directement{gym.phone ? ` (${gym.phone})` : ''} pour connaître les formules.
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button label="S’inscrire en ligne" onPress={() => book('inscription')} style={{ flex: 1 }} />
            <Button label="Séance d’essai" variant="outline" onPress={() => book('essai')} style={{ flex: 1 }} />
          </View>

          {gym.groups.length > 0 ? (
            <>
              <SectionTitle>Matériel par groupe musculaire</SectionTitle>
              <EquipmentTabs groups={gym.groups} initialGroup={typeof group === 'string' ? group : undefined} />
            </>
          ) : null}

          {gym.services.length > 0 ? (
            <>
              <SectionTitle>Services</SectionTitle>
              <View style={styles.servicesGrid}>
                {gym.services.map((s) => (
                  <View key={s.name} style={styles.serviceCell}>
                    <View style={[styles.serviceIcon, { backgroundColor: s.tint }]}>
                      <Text weight="black" color={s.color} style={{ fontSize: 13 }}>
                        {s.icon}
                      </Text>
                    </View>
                    <Text weight="bold" style={{ fontSize: 11.5, flex: 1 }}>
                      {s.name}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {gym.coachIds.length > 0 ? (
            <>
              <SectionTitle>Coachs de la salle</SectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: shadowBleed, paddingLeft: shadowBleed, paddingRight: spacing.md }}
                style={{ marginVertical: -shadowBleed, marginLeft: -shadowBleed }}
              >
                {gym.coachIds.map((cid) => {
                  const c = COACHES.find((x) => x.id === cid);
                  if (!c) return null;
                  return (
                    <Tap key={cid} onPress={() => router.push(`/coach/${cid}`)} style={[styles.coachCard, shadow.soft]}>
                      <Avatar gradient={c.photo} size={54} initial={c.name[0]} />
                      <Text weight="extrabold" style={{ fontSize: 13, marginTop: 8 }} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11 }} numberOfLines={1}>
                        {c.specs[0]}
                      </Text>
                    </Tap>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          {nativeReviews.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: spacing.xl, marginBottom: spacing.md }}>
                <Text weight="black" style={{ fontSize: 16.5 }}>
                  Avis gymhere
                </Text>
                {nativeReviews.length >= 5 ? (
                  <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5 }}>
                    ★ {nativeAvg.toFixed(1)} · {nativeReviews.length} avis
                  </Text>
                ) : null}
              </View>
              {nativeReviews.slice(0, 2).map((r) => (
                <NativeReviewRow key={r.id} review={r} />
              ))}
            </>
          ) : null}
          {nativeReviews.length > 2 ? (
            <Pressable onPress={() => setReviewsOpen(true)} style={{ alignItems: 'center', marginTop: spacing.sm }}>
              <Text weight="extrabold" color={colors.pink} style={{ fontSize: 13 }}>
                Voir les {nativeReviews.length} avis
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => openReport({ targetType: 'gym', targetId: gym.id, targetName: gym.name })}
            style={{ alignItems: 'center', marginTop: spacing.xl }}
          >
            <Text weight="bold" color={colors.textLight} style={{ fontSize: 12.5 }}>
              Signaler un problème sur cette fiche
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <ShareSheet visible={shareOpen} onClose={() => setShareOpen(false)} targetName={gym.name} />

      <BottomSheet visible={reviewsOpen} onClose={() => setReviewsOpen(false)} title={`${nativeReviews.length} avis gymhere`}>
        <ScrollView style={{ paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {nativeReviews.map((r) => (
            <NativeReviewRow key={r.id} review={r} />
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text weight="black" style={{ fontSize: 16.5, marginTop: spacing.xl, marginBottom: spacing.md }}>
      {children}
    </Text>
  );
}

function NativeReviewRow({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <View style={styles.reviewRow}>
      <Avatar size={36} gradient="pinkViolet" />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text weight="extrabold" style={{ fontSize: 13 }}>
          {'★'.repeat(review.stars)} · Avis vérifié
        </Text>
        {review.comment ? (
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 2 }}>
            {review.comment}
          </Text>
        ) : null}
        <Text weight="bold" color={colors.textLight} style={{ fontSize: 11, marginTop: 3 }}>
          {date}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  sub,
  last,
  onPress,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5 }}>
        {label}
      </Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text weight="extrabold" color={onPress ? colors.pink : valueColor ?? colors.ink} style={{ fontSize: 13 }}>
          {value}
        </Text>
        {sub ? (
          <Text weight="semibold" color={colors.textLight} style={{ fontSize: 11 }}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 280, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  roundBtnWrap: { width: 36, height: 36, borderRadius: 18 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  certifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  body: { padding: spacing.lg },
  galleryThumb: { width: 84, height: 84, borderRadius: radius.md, marginRight: 8 },
  immersiveBtn: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  infoCard: { backgroundColor: colors.bgTint, borderRadius: radius.lg, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formula: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  serviceCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    backgroundColor: colors.bgTint,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  serviceIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  coachCard: { width: 120, backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, marginRight: spacing.sm, alignItems: 'flex-start' },
  reviewRow: { flexDirection: 'row', marginBottom: spacing.md },
});
