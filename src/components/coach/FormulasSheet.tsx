import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { FormuleMode } from '../../types';

const MODES: FormuleMode[] = ['Présentiel', 'Visio', 'En ligne'];

export default function FormulasSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const offers = useApp((s) => s.coachDraft.offers);
  const update = useApp((s) => s.updateCoachDraft);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [mode, setMode] = useState<FormuleMode>('Présentiel');
  const [desc, setDesc] = useState('');

  const add = () => {
    if (!name.trim() || !price.trim()) return;
    update({ offers: [...offers, { name, price, duration, mode, desc, per: '', highlight: offers.length === 0 }] });
    setName('');
    setPrice('');
    setDuration('');
    setDesc('');
  };
  const remove = (idx: number) => update({ offers: offers.filter((_, i) => i !== idx) });

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mes formules">
      <ScrollView style={{ paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {offers.map((o, i) => (
          <View key={i} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text weight="extrabold" style={{ fontSize: 13.5 }}>
                {o.name}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5 }}>
                {o.mode} · {o.duration} · {o.price}
              </Text>
            </View>
            <Pressable onPress={() => remove(i)}>
              <Text weight="black" color={colors.danger}>
                ✕
              </Text>
            </Pressable>
          </View>
        ))}

        <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Ajouter une formule
        </Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nom (ex: Suivi en ligne)" placeholderTextColor={colors.textLight} style={styles.input} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
          <TextInput value={duration} onChangeText={setDuration} placeholder="Durée" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} />
          <TextInput value={price} onChangeText={setPrice} placeholder="Prix" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
          {MODES.map((m) => (
            <Chip key={m} label={m} active={mode === m} onPress={() => setMode(m)} />
          ))}
        </View>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder="Description courte"
          placeholderTextColor={colors.textLight}
          style={[styles.input, { marginTop: spacing.sm }]}
        />
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
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
});
