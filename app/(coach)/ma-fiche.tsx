import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import GradientBlock from '../../src/components/ui/GradientBlock';
import { IconChevronRight } from '../../src/components/ui/icons';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useApp, computeCompletion } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import PresentationSheet from '../../src/components/coach/PresentationSheet';
import FormulasSheet from '../../src/components/coach/FormulasSheet';
import CredentialsSheet from '../../src/components/coach/CredentialsSheet';
import AvailabilitySheet from '../../src/components/coach/AvailabilitySheet';
import GymsSheet from '../../src/components/coach/GymsSheet';
import SocialsSheet from '../../src/components/coach/SocialsSheet';
import GallerySheet from '../../src/components/coach/GallerySheet';

type SheetKind = 'presentation' | 'formulas' | 'diplomas' | 'certifs' | 'availability' | 'gyms' | 'socials' | 'gallery' | null;

export default function MaFiche() {
  const draft = useApp((s) => s.coachDraft);
  const togglePublished = useApp((s) => s.togglePublished);
  const coachPlan = useApp((s) => s.coachPlan);
  const { user } = useSession();
  const [sheet, setSheet] = useState<SheetKind>(null);

  const completion = computeCompletion(draft);
  const firstName = (user?.name ?? draft.name ?? 'toi').split(' ')[0];

  const publishToggle = (v: boolean) => {
    if (v && coachPlan !== 'actif') {
      router.push('/coach-subscription');
      return;
    }
    togglePublished();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12 }}>
          Espace coach · {firstName}
        </Text>
        <Text weight="black" style={{ fontSize: 21, marginTop: 2 }}>
          Ma fiche pro
        </Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={[styles.completionCard, shadow.soft]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text weight="extrabold" style={{ fontSize: 13 }}>
              Complétion de ta fiche
            </Text>
            <Text weight="black" color={colors.pink} style={{ fontSize: 22 }}>
              {completion}%
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${completion}%` }]} />
          </View>
          {completion < 100 ? (
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: spacing.sm }}>
              Complète toutes les sections pour mieux ressortir dans les recherches.
            </Text>
          ) : null}
        </View>

        {coachPlan === 'actif' ? (
          <Pressable onPress={() => router.push('/coach-subscription')} style={[styles.planCard, styles.planCardActive]}>
            <View style={styles.planIconBox}>
              <Text style={{ fontSize: 16 }}>⭐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text weight="black" style={{ fontSize: 13.5 }}>
                  Abonnement
                </Text>
                <View style={styles.activePill}>
                  <Text weight="black" color={colors.successDeep} style={{ fontSize: 9.5 }}>
                    ACTIF
                  </Text>
                </View>
              </View>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
                Formule, facturation, résiliation
              </Text>
            </View>
            <IconChevronRight size={16} color={colors.textLight} />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/coach-subscription')} style={[{ borderRadius: radius.lg, marginBottom: spacing.md }, shadow.glowPink]}>
            <GradientBlock kind="pinkViolet" style={styles.planCard}>
              <View style={[styles.planIconBox, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <Text style={{ fontSize: 16 }}>⭐</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="black" color="#fff" style={{ fontSize: 13.5 }}>
                  Passer en formule Pro
                </Text>
                <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 11.5, marginTop: 2 }}>
                  Publie ta fiche, reçois des demandes en illimité
                </Text>
              </View>
              <IconChevronRight size={16} color="#fff" />
            </GradientBlock>
          </Pressable>
        )}

        <View style={styles.publishRow}>
          <View style={{ flex: 1 }}>
            <Text weight="extrabold" style={{ fontSize: 14 }}>
              Fiche {draft.published ? 'visible' : 'masquée'}
            </Text>
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
              {coachPlan === 'actif' ? 'Les pratiquants peuvent te trouver.' : 'Un abonnement est nécessaire pour publier.'}
            </Text>
          </View>
          <Switch value={draft.published} onValueChange={publishToggle} trackColor={{ true: colors.pink }} />
        </View>

        <Pressable onPress={() => router.push('/coach-preview')} style={styles.previewBtn}>
          <Text weight="extrabold" color={colors.pink} style={{ fontSize: 13 }}>
            Voir ma fiche publique
          </Text>
        </Pressable>

        <SectionRow label="Ma présentation" sub={draft.bio ? 'Bio, zone et spécialités renseignées' : 'Bio, photo, zone, spécialités'} onPress={() => setSheet('presentation')} />
        <SectionRow label="Mes formules" sub={`${draft.offers.length} formule${draft.offers.length !== 1 ? 's' : ''}`} onPress={() => setSheet('formulas')} />
        <SectionRow label="Diplômes d’État" sub={`${draft.diplomas.length} diplôme${draft.diplomas.length !== 1 ? 's' : ''}`} onPress={() => setSheet('diplomas')} />
        <SectionRow label="Certifications" sub={`${draft.certifs.length} certification${draft.certifs.length !== 1 ? 's' : ''}`} onPress={() => setSheet('certifs')} />
        <SectionRow label="Mes disponibilités" sub="Créneaux par service et par jour" onPress={() => setSheet('availability')} />
        <SectionRow label="Salles où j’interviens" sub={`${draft.gymIds.length} salle${draft.gymIds.length !== 1 ? 's' : ''}`} onPress={() => setSheet('gyms')} />
        <SectionRow label="Réseaux sociaux" sub="Instagram, TikTok, YouTube, LinkedIn" onPress={() => setSheet('socials')} />
        <SectionRow label="Galerie photos" sub={`${draft.galleryCount} photo${draft.galleryCount !== 1 ? 's' : ''}`} onPress={() => setSheet('gallery')} last />
      </ScrollView>

      <PresentationSheet visible={sheet === 'presentation'} onClose={() => setSheet(null)} />
      <FormulasSheet visible={sheet === 'formulas'} onClose={() => setSheet(null)} />
      <CredentialsSheet visible={sheet === 'diplomas'} onClose={() => setSheet(null)} kind="diplomas" title="Diplômes d’État" />
      <CredentialsSheet visible={sheet === 'certifs'} onClose={() => setSheet(null)} kind="certifs" title="Certifications" />
      <AvailabilitySheet visible={sheet === 'availability'} onClose={() => setSheet(null)} />
      <GymsSheet visible={sheet === 'gyms'} onClose={() => setSheet(null)} />
      <SocialsSheet visible={sheet === 'socials'} onClose={() => setSheet(null)} />
      <GallerySheet visible={sheet === 'gallery'} onClose={() => setSheet(null)} />
    </View>
  );
}

function SectionRow({ label, sub, onPress, last }: { label: string; sub: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text weight="extrabold" style={{ fontSize: 14 }}>
          {label}
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <Text weight="black" color={colors.textLight} style={{ fontSize: 16 }}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  completionCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.pink },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  planCardActive: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  planIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.bgTint2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: { backgroundColor: colors.successBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTint,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  previewBtn: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
});
