import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import GradientBlock from '../src/components/ui/GradientBlock';
import { colors, radius, spacing } from '../src/theme';
import { useApp } from '../src/store/app';

const BENEFITS = [
  'Fiche pro visible par tous les pratiquants de ta ville',
  'Réception illimitée de demandes',
  'Disponibilités réelles synchronisées avec tes réservations',
  'Badge de vérification sur tes diplômes et certifications',
];

export default function CoachSubscription() {
  const [billing, setBilling] = useState<'mensuel' | 'annuel'>('annuel');
  const activatePlan = useApp((s) => s.activateCoachPlan);
  const togglePublished = useApp((s) => s.togglePublished);
  const published = useApp((s) => s.coachDraft.published);

  const subscribe = () => {
    activatePlan();
    if (!published) togglePublished();
    router.replace('/(coach)/ma-fiche');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Abonnement coach" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <GradientBlock kind="brand" style={styles.hero}>
          <Text weight="black" color="#fff" style={{ fontSize: 20, textAlign: 'center' }}>
            Publie ta fiche, reçois des demandes
          </Text>
          <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 12.5, textAlign: 'center', marginTop: 6 }}>
            Les pratiquants sont 100% gratuits. Seuls les coachs s’abonnent.
          </Text>
        </GradientBlock>

        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Text weight="black" color={colors.pink}>
              ✓
            </Text>
            <Text weight="semibold" style={{ fontSize: 13.5, flex: 1, marginLeft: spacing.sm }}>
              {b}
            </Text>
          </View>
        ))}

        <View style={styles.plans}>
          <Pressable onPress={() => setBilling('mensuel')} style={[styles.plan, billing === 'mensuel' && styles.planActive]}>
            <Text weight="extrabold" style={{ fontSize: 13.5 }}>
              Mensuel
            </Text>
            <Text weight="black" style={{ fontSize: 20, marginTop: 4 }}>
              9€<Text weight="bold" style={{ fontSize: 12 }}>/mois</Text>
            </Text>
          </Pressable>
          <Pressable onPress={() => setBilling('annuel')} style={[styles.plan, billing === 'annuel' && styles.planActive]}>
            <View style={styles.saveTag}>
              <Text weight="black" color="#fff" style={{ fontSize: 9.5 }}>
                -35%
              </Text>
            </View>
            <Text weight="extrabold" style={{ fontSize: 13.5 }}>
              Annuel
            </Text>
            <Text weight="black" style={{ fontSize: 20, marginTop: 4 }}>
              5,75€<Text weight="bold" style={{ fontSize: 12 }}>/mois</Text>
            </Text>
            <Text weight="semibold" color={colors.textLight} style={{ fontSize: 10.5, marginTop: 1 }}>
              soit 69€/an
            </Text>
          </Pressable>
        </View>

        <Button label="Démarrer mon essai gratuit" onPress={subscribe} style={{ marginTop: spacing.xl }} />
        <Text weight="semibold" color={colors.textLight} style={{ fontSize: 11, textAlign: 'center', marginTop: spacing.md }}>
          7 jours offerts, résiliable à tout moment. Paiement sécurisé par Stripe.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  plans: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  plan: { flex: 1, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md },
  planActive: { borderColor: colors.pink, backgroundColor: '#FFE9F1' },
  saveTag: { position: 'absolute', top: -8, right: 10, backgroundColor: colors.pink, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
});
