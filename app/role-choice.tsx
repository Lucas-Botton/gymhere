import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import GradientBlock from '../src/components/ui/GradientBlock';
import { PinMark } from '../src/components/ui/Logo';
import { colors, radius, spacing } from '../src/theme';
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
        <Text weight="black" style={{ fontSize: 24, textAlign: 'center' }}>
          Tu viens pour…
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: spacing.xxl }}>
          Tu pourras changer d’avis à tout moment.
        </Text>

        <Pressable onPress={chooseMember}>
          <GradientBlock kind="pinkViolet" style={styles.card}>
            <PinMark size={38} />
            <Text weight="black" color="#fff" style={{ fontSize: 19, marginTop: spacing.md }}>
              Je m’entraîne
            </Text>
            <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 13, marginTop: 4 }}>
              Trouve ta salle et ton coach à Lyon, gratuitement.
            </Text>
          </GradientBlock>
        </Pressable>

        <View style={{ height: spacing.lg }} />

        <Pressable onPress={chooseCoach} style={[styles.card, { backgroundColor: colors.ink }]}>
          <Text style={{ fontSize: 38 }}>🏋️</Text>
          <Text weight="black" color="#fff" style={{ fontSize: 19, marginTop: spacing.md }}>
            Je suis coach
          </Text>
          <Text weight="semibold" color="rgba(255,255,255,0.7)" style={{ fontSize: 13, marginTop: 4 }}>
            Publie ta fiche pro et reçois des demandes.
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  card: { borderRadius: radius.xxl, padding: spacing.xl, minHeight: 150, justifyContent: 'center' },
});
