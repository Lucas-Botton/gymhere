import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import GradientBlock from '../src/components/ui/GradientBlock';
import { colors, radius, spacing } from '../src/theme';
import { GYMS } from '../src/data/seed';
import { normalize } from '../src/lib/filters';
import { useApp } from '../src/store/app';
import { useSession } from '../src/store/session';

export default function ClaimGym() {
  const [query, setQuery] = useState('');
  const claimedGymIds = useApp((s) => s.claimedGymIds);
  const markGymClaimed = useApp((s) => s.markGymClaimed);
  const { requireAuth, claimGym } = useSession();

  const results = query.trim() ? GYMS.filter((g) => normalize(g.name).includes(normalize(query))) : GYMS;

  const claim = (gymId: string, gymName: string) => {
    requireAuth(`revendiquer la fiche de "${gymName}"`, () => {
      claimGym(gymId);
      markGymClaimed(gymId);
      router.replace('/ma-salle');
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Revendiquer ma salle" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, lineHeight: 19, marginBottom: spacing.md }}>
          Trouve ta salle dans la liste ci-dessous pour reprendre la main sur sa fiche — horaires, téléphone, site web. C’est gratuit et immédiat.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher ta salle..."
          placeholderTextColor={colors.textLight}
          style={styles.input}
        />

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {results.map((g) => {
            const claimed = !!g.ownerId || claimedGymIds.includes(g.id);
            return (
              <Pressable key={g.id} onPress={() => !claimed && claim(g.id, g.name)} disabled={claimed} style={[styles.row, claimed && { opacity: 0.55 }]}>
                <GradientBlock kind={g.photo} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text weight="extrabold" style={{ fontSize: 14 }}>
                    {g.name}
                  </Text>
                  <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12, marginTop: 1 }}>
                    {g.quartier}
                  </Text>
                </View>
                {claimed ? (
                  <View style={styles.claimedPill}>
                    <Text weight="black" color={colors.successDeep} style={{ fontSize: 10.5 }}>
                      Revendiquée
                    </Text>
                  </View>
                ) : (
                  <Text weight="black" color={colors.pink} style={{ fontSize: 12.5 }}>
                    Revendiquer
                  </Text>
                )}
              </Pressable>
            );
          })}
          {results.length === 0 ? (
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, textAlign: 'center', marginTop: spacing.xl }}>
              Aucune salle trouvée pour « {query} ».
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  thumb: { width: 40, height: 40, borderRadius: 12 },
  claimedPill: { backgroundColor: colors.successBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
});
