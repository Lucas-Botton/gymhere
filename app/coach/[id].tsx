import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import Tap from '../../src/components/ui/Tap';
import Button from '../../src/components/ui/Button';
import GradientBlock from '../../src/components/ui/GradientBlock';
import Glass from '../../src/components/ui/Glass';
import { Avatar, StarRating, Tag, VerifiedPill } from '../../src/components/ui/primitives';
import { IconBack, IconHeart, IconShare } from '../../src/components/ui/icons';
import ShareSheet from '../../src/components/ui/ShareSheet';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { findCoach, findGym } from '../../src/data/seed';
import { useApp } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import { useBookingSheet } from '../../src/store/booking';
import { useReportSheet } from '../../src/store/report';
import { bookingActionVerb } from '../../src/lib/booking-config';
import { ServiceKey } from '../../src/types';

const SOCIAL_META: Record<string, { label: string; bg: string }> = {
  instagram: { label: 'Instagram', bg: '#DD2A7B' },
  tiktok: { label: 'TikTok', bg: '#1A1024' },
  youtube: { label: 'YouTube', bg: '#FF0000' },
  linkedin: { label: 'LinkedIn', bg: '#0A66C2' },
};

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coach = findCoach(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [openOfferIdx, setOpenOfferIdx] = useState<number | null>(coach?.offers.findIndex((o) => o.highlight) ?? null);
  const isFav = useApp((s) => (coach ? s.favCoaches.includes(coach.id) : false));
  const toggleFav = useApp((s) => s.toggleFavCoach);
  const { requireAuth } = useSession();
  const openBooking = useBookingSheet((s) => s.openSheet);
  const openReport = useReportSheet((s) => s.openSheet);

  if (!coach) {
    return (
      <SafeAreaView style={styles.center}>
        <Text weight="bold">Coach introuvable.</Text>
      </SafeAreaView>
    );
  }

  const chooseOffer = (idx: number) => {
    const o = coach.offers[idx];
    const online = o.mode === 'En ligne';
    const serviceKey: ServiceKey | null = o.mode === 'Visio' ? 'Visio' : o.mode === 'Présentiel' ? 'Présentiel salle' : null;
    requireAuth(`réserver "${o.name}" avec ${coach.name}`, () =>
      openBooking({
        kind: 'formule',
        targetType: 'coach',
        targetId: coach.id,
        targetName: coach.name,
        sub: o.name,
        mode: online ? 'request' : 'slot',
        coachId: coach.id,
        serviceKey,
      })
    );
  };

  const contact = () =>
    requireAuth(`${bookingActionVerb('contact')} ${coach.name}`, () =>
      openBooking({ kind: 'contact', targetType: 'coach', targetId: coach.id, targetName: coach.name, mode: 'request', coachId: coach.id })
    );

  const appel = () =>
    requireAuth(`${bookingActionVerb('appel')} ${coach.name}`, () =>
      openBooking({ kind: 'appel', targetType: 'coach', targetId: coach.id, targetName: coach.name, mode: 'slot', coachId: coach.id, serviceKey: 'Visio' })
    );

  const socialEntries = Object.entries(coach.socials).filter(([, v]) => !!v);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <GradientBlock kind={coach.photo as any} style={styles.hero}>
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
              <Tap onPress={() => toggleFav(coach.id)} scaleTo={0.8} style={styles.roundBtnWrap}>
                <Glass variant="dark" style={styles.roundBtn}>
                  <IconHeart size={16} color="#fff" filled={isFav} />
                </Glass>
              </Tap>
            </View>
          </SafeAreaView>
        </GradientBlock>

        <View style={styles.body}>
          <Text weight="black" style={{ fontSize: 22 }}>
            {coach.name}
          </Text>
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
            <StarRating rating={coach.rating} /> {coach.rating} ({coach.reviews} avis) · {coach.zone}
          </Text>
          <View style={styles.tagsRow}>
            {coach.specs.slice(0, 3).map((s) => (
              <Tag key={s} label={s} />
            ))}
          </View>

          <SectionTitle>À propos</SectionTitle>
          <Text weight="semibold" color={colors.ink} style={{ fontSize: 13.5, lineHeight: 20 }}>
            {coach.bio}
          </Text>

          <SectionTitle>Mon accompagnement</SectionTitle>
          <View style={styles.modalitiesWrap}>
            {coach.modalities.map((m) => (
              <View key={m} style={styles.modalityPill}>
                <Text weight="extrabold" color={colors.tagText} style={{ fontSize: 12 }}>
                  {m}
                </Text>
              </View>
            ))}
          </View>

          <SectionTitle>Formules d’accompagnement</SectionTitle>
          {coach.offers.map((o, i) => {
            const open = openOfferIdx === i;
            const tagColor = o.mode === 'Présentiel' ? colors.pink : o.mode === 'Visio' ? colors.blue : colors.violet;
            return (
              <Tap
                key={o.name}
                onPress={() => setOpenOfferIdx(open ? null : i)}
                style={[styles.offer, o.highlight && { borderColor: colors.pink }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text weight="extrabold" style={{ fontSize: 14.5 }}>
                        {o.name}
                      </Text>
                      {o.highlight ? (
                        <View style={styles.recoTag}>
                          <Text weight="black" color="#fff" style={{ fontSize: 9.5 }}>
                            RECOMMANDÉ
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text weight="bold" color={tagColor} style={{ fontSize: 11.5, marginTop: 3 }}>
                      {o.mode} · {o.duration}
                    </Text>
                  </View>
                  <Text weight="black" style={{ fontSize: 15 }}>
                    {o.price}
                    <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11 }}>
                      {o.per}
                    </Text>
                  </Text>
                </View>
                {open ? (
                  <>
                    <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: spacing.sm, lineHeight: 18 }}>
                      {o.desc}
                    </Text>
                    <Button label="Choisir cette formule" size="sm" onPress={() => chooseOffer(i)} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
                  </>
                ) : null}
              </Tap>
            );
          })}

          <SectionTitle>Diplômes & certifications</SectionTitle>
          <View style={styles.credBlock}>
            <Text weight="extrabold" color={colors.successDeep} style={{ fontSize: 12, marginBottom: 8 }}>
              Diplômes d’État
            </Text>
            {coach.diplomas.map((d) => (
              <View key={d.label} style={styles.credRow}>
                <Text weight="semibold" style={{ fontSize: 13, flex: 1 }}>
                  {d.label}
                </Text>
                <VerifiedPill verified={d.verified} />
              </View>
            ))}
          </View>
          <View style={[styles.credBlock, { backgroundColor: '#F4F0FC', marginTop: spacing.sm }]}>
            <Text weight="extrabold" color={colors.tagText} style={{ fontSize: 12, marginBottom: 8 }}>
              Certifications
            </Text>
            {coach.certifs.map((c) => (
              <View key={c.label} style={styles.credRow}>
                <Text weight="semibold" style={{ fontSize: 13, flex: 1 }}>
                  {c.label}
                </Text>
                <VerifiedPill verified={c.verified} />
              </View>
            ))}
          </View>

          {socialEntries.length > 0 ? (
            <>
              <SectionTitle>Mes réseaux</SectionTitle>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {socialEntries.map(([key, value]) => {
                  const meta = SOCIAL_META[key];
                  return (
                    <Pressable key={key} style={[styles.socialBtn, { backgroundColor: meta.bg }]}>
                      <Text weight="extrabold" color="#fff" style={{ fontSize: 11 }}>
                        {meta.label}
                      </Text>
                      <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 10 }}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {coach.gymIds.length > 0 ? (
            <>
              <SectionTitle>Intervient à</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }} style={{ marginVertical: -10 }}>
                {coach.gymIds.map((gid) => {
                  const g = findGym(gid);
                  if (!g) return null;
                  return (
                    <Tap key={gid} onPress={() => router.push(`/gym/${gid}`)} style={[styles.gymChip, shadow.soft]}>
                      <Text weight="extrabold" style={{ fontSize: 13 }}>
                        {g.name}
                      </Text>
                    </Tap>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          <SectionTitle>Galerie</SectionTitle>
          <View style={styles.galleryGrid}>
            {coach.gallery.map((g, i) => (
              <GradientBlock key={i} kind={g as any} style={styles.galleryCell} />
            ))}
          </View>

          <Pressable
            onPress={() => openReport({ targetType: 'coach', targetId: coach.id, targetName: coach.name })}
            style={{ alignItems: 'center', marginTop: spacing.xl }}
          >
            <Text weight="bold" color={colors.textLight} style={{ fontSize: 12.5 }}>
              Signaler un problème sur cette fiche
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.ctaBar}>
        <Button label="Appel découverte" variant="outline" onPress={appel} style={{ flex: 1 }} />
        <Button label="Contacter" onPress={contact} style={{ flex: 1 }} />
      </SafeAreaView>

      <ShareSheet visible={shareOpen} onClose={() => setShareOpen(false)} targetName={coach.name} />
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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 260 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  roundBtnWrap: { width: 36, height: 36, borderRadius: 18 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  modalitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalityPill: { backgroundColor: colors.tagBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  offer: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  recoTag: { backgroundColor: colors.pink, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
  credBlock: { backgroundColor: colors.successBg, borderRadius: radius.lg, padding: spacing.md },
  credRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  socialBtn: { flex: 1, borderRadius: radius.md, padding: spacing.md },
  gymChip: { backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 12, marginRight: spacing.sm },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryCell: { width: '31.5%', aspectRatio: 1, borderRadius: radius.md },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
