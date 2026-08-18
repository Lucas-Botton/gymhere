import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { useLocationStore } from '../../store/location';
import { BRANDS, SERVICES } from '../../data/seed';
import { GYMS } from '../../data/seed';
import { gymPassesFilters, POPULAR_EQUIPMENT } from '../../lib/filters';

export default function FiltersSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const stored = useApp((s) => s.filters);
  const setFilters = useApp((s) => s.setFilters);
  const resetFilters = useApp((s) => s.resetFilters);

  const [local, setLocal] = useState(stored);
  useEffect(() => {
    if (visible) setLocal(stored);
  }, [visible]);

  const toggle = (key: 'brands' | 'services', value: string) => {
    setLocal((s) => ({ ...s, [key]: s[key].includes(value) ? s[key].filter((x) => x !== value) : [...s[key], value] }));
  };

  const coords = useLocationStore((s) => s.coords);
  const matchCount = GYMS.filter((g) => gymPassesFilters(g, local, coords)).length;

  const apply = () => {
    setFilters(local);
    onClose();
  };
  const reset = () => {
    resetFilters();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filtres">
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <Section label="Matériel spécifique">
          <TextInput
            value={local.equipQuery}
            onChangeText={(v) => setLocal((s) => ({ ...s, equipQuery: v }))}
            placeholder="Hack squat, Eleiko, rameur..."
            placeholderTextColor={colors.textLight}
            style={styles.input}
          />
          <View style={styles.wrapRow}>
            {POPULAR_EQUIPMENT.slice(0, 6).map((e) => (
              <Chip key={e} label={e} active={local.equipQuery === e} onPress={() => setLocal((s) => ({ ...s, equipQuery: e }))} />
            ))}
          </View>
        </Section>

        <Section label="Services">
          <View style={styles.wrapRow}>
            {SERVICES.map((s) => (
              <Chip key={s} label={s} active={local.services.includes(s)} onPress={() => toggle('services', s)} />
            ))}
          </View>
        </Section>

        <Section label="Marque présente">
          <View style={styles.wrapRow}>
            {BRANDS.map((b) => (
              <Chip key={b} label={b} active={local.brands.includes(b)} onPress={() => toggle('brands', b)} />
            ))}
          </View>
        </Section>

        <Section label={`Prix max : ${local.priceMax}€/mois`}>
          <Slider
            minimumValue={20}
            maximumValue={80}
            step={1}
            value={local.priceMax}
            onValueChange={(v: number) => setLocal((s) => ({ ...s, priceMax: Math.round(v) }))}
            minimumTrackTintColor={colors.pink}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.pink}
          />
        </Section>

        <Section label={`Distance max : ${local.distance} km`}>
          <Slider
            minimumValue={0.5}
            maximumValue={15}
            step={0.5}
            value={local.distance}
            onValueChange={(v: number) => setLocal((s) => ({ ...s, distance: v }))}
            minimumTrackTintColor={colors.pink}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.pink}
          />
        </Section>

        <Section label="Note minimale">
          <View style={styles.wrapRow}>
            {[0, 3.5, 4, 4.5].map((r) => (
              <Chip key={r} label={r === 0 ? 'Toutes' : `${r}+`} active={local.minRating === r} onPress={() => setLocal((s) => ({ ...s, minRating: r }))} />
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={reset} style={styles.resetBtn}>
          <Text weight="extrabold" color={colors.ink} style={{ fontSize: 13.5 }}>
            Réinitialiser
          </Text>
        </Pressable>
        <Button label={`Voir ${matchCount} salle${matchCount > 1 ? 's' : ''}`} onPress={apply} style={{ flex: 1 }} />
      </View>
    </BottomSheet>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13.5,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetBtn: { paddingVertical: 14, paddingHorizontal: 4 },
});
