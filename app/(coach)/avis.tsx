import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../src/components/ui/Text';
import { Avatar } from '../../src/components/ui/primitives';
import { colors, radius, spacing } from '../../src/theme';

const DEMO_REVIEWS = [
  { name: 'Thomas M.', stars: 5, text: 'Super accompagnement, à l’écoute et très pédagogue. Je recommande à 100%.' },
  { name: 'Sarah B.', stars: 5, text: 'Programme HYROX au top, résultats visibles en un mois. Merci !' },
  { name: 'Karim D.', stars: 4, text: 'Très ponctuel et motivant, bons conseils nutrition en plus.' },
];

export default function Avis() {
  const avg = (DEMO_REVIEWS.reduce((n, r) => n + r.stars, 0) / DEMO_REVIEWS.length).toFixed(1);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Avis
        </Text>
        <View style={styles.avgCard}>
          <Text weight="black" style={{ fontSize: 32 }}>
            {avg}
          </Text>
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12 }}>
            {'★'.repeat(Math.round(Number(avg)))} · {DEMO_REVIEWS.length} avis
          </Text>
        </View>
      </SafeAreaView>
      <FlatList
        data={DEMO_REVIEWS}
        keyExtractor={(r) => r.name}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar size={38} initial={item.name[0]} gradient="pinkViolet" />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text weight="extrabold" style={{ fontSize: 13.5 }}>
                {item.name} · {'★'.repeat(item.stars)}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 3, lineHeight: 18 }}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  avgCard: { alignItems: 'center', backgroundColor: colors.bgTint, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  row: { flexDirection: 'row', marginBottom: spacing.lg },
});
