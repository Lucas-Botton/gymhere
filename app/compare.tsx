import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import GradientBlock from '../src/components/ui/GradientBlock';
import { Chip } from '../src/components/ui/primitives';
import { colors, radius, shadow, spacing } from '../src/theme';
import { GYMS } from '../src/data/seed';
import { normalize, gymBrands, gymServiceNames } from '../src/lib/filters';

export default function Compare() {
  const [ids, setIds] = useState<string[]>(['iron', 'crx']);
  const [query, setQuery] = useState('');

  const toggle = (id: string) => {
    setIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : a.length < 3 ? [...a, id] : a));
  };

  const q = normalize(query.trim());
  const options = GYMS.filter((g) => q === '' || normalize(g.name).includes(q));
  const selected = GYMS.filter((g) => ids.includes(g.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgTint }}>
      <View style={styles.header}>
        <ScreenHeader title="Comparer" />
        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginLeft: spacing.lg, marginTop: -8, marginBottom: spacing.md }}>
          {ids.length} salle(s) · 3 max
        </Text>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <View style={styles.searchBar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Chercher une salle par son nom…"
              placeholderTextColor={colors.textLight}
              style={styles.searchInput}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }} contentContainerStyle={{ gap: 8 }}>
            {options.map((g) => (
              <Chip key={g.id} label={g.name} active={ids.includes(g.id)} onPress={() => toggle(g.id)} />
            ))}
            {options.length === 0 ? (
              <Text weight="bold" color={colors.textLight} style={{ fontSize: 12.5, paddingVertical: 8 }}>
                Aucune salle à ce nom
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
        {selected.map((g) => {
          const machines = g.groups.reduce((n, gr) => n + gr.items.reduce((m, it) => m + it.qty, 0), 0);
          const has247 = gymServiceNames(g).includes('Ouvert 24/7');
          const brands = gymBrands(g).slice(0, 2).join(', ') || '–';
          return (
            <View key={g.id} style={[styles.card, shadow.card]}>
              <View style={{ height: 92 }}>
                <GradientBlock kind={g.photo as any} style={StyleSheet.absoluteFill} />
                <Pressable onPress={() => toggle(g.id)} style={styles.removeBtn}>
                  <Text weight="black" color={colors.ink} style={{ fontSize: 12 }}>
                    ✕
                  </Text>
                </Pressable>
              </View>
              <View style={styles.cardBody}>
                <Text weight="black" style={{ fontSize: 15, lineHeight: 19, minHeight: 38 }}>
                  {g.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
                  <Text weight="black" color={colors.pink} style={{ fontSize: 24 }}>
                    {g.priceFrom}€
                  </Text>
                  <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12 }}>
                    /mois
                  </Text>
                </View>

                <StatRow label="Note" value={`★ ${g.rating}`} />
                <StatRow label="Distance" value={`${g.distanceKm.toFixed(1).replace('.', ',')} km`} />
                <StatRow label="Ouvert 24/7" value={has247 ? 'Oui' : '–'} valueColor={has247 ? colors.successDeep : colors.textLight} />
                <StatRow label="Certifié" value={g.certified ? 'Certifié' : '–'} valueColor={g.certified ? colors.pink : colors.textLight} />
                <StatRow label="Machines dispo" value={String(machines)} />
                <StatRow label="Services" value={String(g.services.length)} />
                <View style={styles.statRow}>
                  <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 12 }}>
                    Marques clés
                  </Text>
                </View>
                <Text weight="black" style={{ fontSize: 12.5, marginTop: 3, marginBottom: spacing.md, minHeight: 32 }}>
                  {brands}
                </Text>

                <Pressable onPress={() => router.push(`/gym/${g.id}`)} style={styles.viewBtn}>
                  <Text weight="black" color="#fff" style={{ fontSize: 13 }}>
                    Voir la salle
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {ids.length < 3 ? (
          <View style={styles.addMore}>
            <Text weight="extrabold" color={colors.textLight} style={{ fontSize: 13, textAlign: 'center' }}>
              Ajoute une salle ci-dessus ↑
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, lineHeight: 19, paddingHorizontal: spacing.xl, marginTop: spacing.sm }}>
        💡 Astuce : compare le{' '}
        <Text weight="black" color={colors.violet} style={{ fontSize: 12.5 }}>
          nombre de machines disponibles
        </Text>{' '}
        et les marques présentes pour trouver la salle la mieux équipée pour toi.
      </Text>
    </View>
  );
}

function StatRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statRow}>
      <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Text weight="black" color={valueColor ?? colors.ink} style={{ fontSize: 13.5 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  searchBar: { backgroundColor: colors.bgTint2, borderRadius: 13, paddingHorizontal: spacing.md, height: 44, justifyContent: 'center' },
  searchInput: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.ink },
  cardsRow: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, alignItems: 'stretch' },
  card: { width: 216, backgroundColor: '#fff', borderRadius: radius.xxl, overflow: 'hidden' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: spacing.md, flex: 1 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2EDF4',
  },
  viewBtn: { marginTop: 'auto', backgroundColor: colors.pink, borderRadius: 13, paddingVertical: 11, alignItems: 'center' },
  addMore: {
    width: 150,
    borderWidth: 1.5,
    borderColor: '#E3D6E6',
    borderStyle: 'dashed',
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
});
