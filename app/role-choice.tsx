import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../src/components/ui/Text';
import { Wordmark } from '../src/components/ui/Logo';
import { IconDumbbell, IconBolt, IconChevronRight } from '../src/components/ui/icons';
import { colors, radius, shadow, spacing } from '../src/theme';
import { useSession } from '../src/store/session';

export default function RoleChoice() {
  const { chooseRole } = useSession();

  const chooseMember = () => {
    chooseRole('member');
    router.replace('/(member)/explore');
  };
  const chooseCoach = () => {
    chooseRole('coach');
    router.replace('/coach-signup');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.wrap}>
        <Wordmark size={22} color={colors.ink} />

        <Text weight="black" style={{ fontSize: 26, letterSpacing: -0.6, marginTop: spacing.xxl, lineHeight: 30 }}>
          Tu viens pour…
        </Text>
        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 14.5, marginTop: 7, lineHeight: 20 }}>
          On adapte l’app à ton profil. Tu pourras changer à tout moment.
        </Text>

        <Pressable onPress={chooseMember} style={[{ marginTop: spacing.xl }, shadow.glowPink]}>
          <LinearGradient colors={['#FF6B6B', colors.pink]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <IconDumbbell size={30} color="#fff" />
            <Text weight="black" color="#fff" style={{ fontSize: 20, marginTop: spacing.md }}>
              Je m’entraîne
            </Text>
            <Text weight="bold" color="rgba(255,255,255,0.9)" style={{ fontSize: 13.5, marginTop: 4, lineHeight: 18 }}>
              Trouver ma salle, le bon matériel et un coach à Lyon.
            </Text>
            <View style={styles.linkRow}>
              <Text weight="black" color="#fff" style={{ fontSize: 13.5 }}>
                Commencer
              </Text>
              <IconChevronRight size={15} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={chooseCoach} style={[{ marginTop: spacing.md }, shadow.glowViolet]}>
          <View style={[styles.card, styles.coachCard]}>
            <LinearGradient colors={[colors.violet, colors.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.coachIconBox}>
              <IconBolt size={20} color="#fff" />
            </LinearGradient>
            <Text weight="black" style={{ fontSize: 20, marginTop: spacing.md }}>
              Je suis coach
            </Text>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 13.5, marginTop: 4, lineHeight: 18 }}>
              Créer ma fiche pro, mes formules et recevoir des demandes.
            </Text>
            <View style={styles.linkRow}>
              <Text weight="black" color={colors.violet} style={{ fontSize: 13.5 }}>
                Ouvrir mon espace
              </Text>
              <IconChevronRight size={15} color={colors.violet} />
            </View>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, paddingTop: spacing.xl },
  card: { borderRadius: radius.xxl, padding: spacing.xl, overflow: 'hidden' },
  coachCard: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border },
  coachIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
});
