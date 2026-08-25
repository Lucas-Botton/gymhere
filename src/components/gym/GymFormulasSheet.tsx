import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { colors, radius, spacing } from '../../theme';
import { useApp, withGymOverride } from '../../store/app';
import { updateGymRemote } from '../../lib/gymsRepo';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';
import { GymFormula } from '../../types';

export default function GymFormulasSheet({ visible, onClose, gymId }: { visible: boolean; onClose: () => void; gymId: string }) {
  const baseGym = useApp((s) => s.gyms.find((g) => g.id === gymId));
  const gymOverrides = useApp((s) => s.gymOverrides);
  const updateGymOverride = useApp((s) => s.updateGymOverride);
  const gym = baseGym ? withGymOverride(baseGym, gymOverrides) : null;
  const formulas = gym?.formulas ?? [];

  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [price, setPrice] = useState('');
  const kb = useKeyboardScrollFix();

  const commit = (next: GymFormula[]) => {
    updateGymOverride(gymId, { formulas: next });
    updateGymRemote(gymId, { formulas: next });
  };

  const add = () => {
    if (!name.trim() || !price.trim()) return;
    commit([...formulas, { name: name.trim(), sub: sub.trim(), price: price.trim(), highlight: formulas.length === 0 }]);
    setName('');
    setSub('');
    setPrice('');
  };
  const remove = (idx: number) => commit(formulas.filter((_, i) => i !== idx));
  const toggleHighlight = (idx: number) => commit(formulas.map((f, i) => ({ ...f, highlight: i === idx ? !f.highlight : f.highlight })));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mes formules">
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: spacing.md }}>
          Abonnements, séances à l'unité, pass découverte... ce que tu proposes et à quel prix.
        </Text>

        {formulas.map((f, i) => (
          <View key={i} style={styles.item}>
            <Pressable onPress={() => toggleHighlight(i)} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text weight="extrabold" style={{ fontSize: 13.5 }}>
                  {f.name}
                </Text>
                {f.highlight ? (
                  <View style={styles.highlightPill}>
                    <Text weight="black" color={colors.pink} style={{ fontSize: 9.5 }}>
                      MISE EN AVANT
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
                {f.sub ? `${f.sub} · ` : ''}
                {f.price}
              </Text>
            </Pressable>
            <Pressable onPress={() => remove(i)} hitSlop={8}>
              <Text weight="black" color={colors.danger}>
                ✕
              </Text>
            </Pressable>
          </View>
        ))}

        <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Ajouter une formule
        </Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nom (ex: Abonnement mensuel)" placeholderTextColor={colors.textLight} style={styles.input} {...kb.inputProps} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
          <TextInput value={sub} onChangeText={setSub} placeholder="Détail (ex: sans engagement)" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} {...kb.inputProps} />
          <TextInput value={price} onChangeText={setPrice} placeholder="Prix (ex: 29,90€/mois)" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} {...kb.inputProps} />
        </View>
        <Text weight="semibold" color={colors.textLight} style={{ fontSize: 11, marginTop: 6, lineHeight: 15 }}>
          Touche une formule dans la liste pour la mettre en avant sur ta fiche.
        </Text>
        <Button label="Ajouter la formule" variant="outline" onPress={add} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  highlightPill: { backgroundColor: colors.bgTint2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
});
