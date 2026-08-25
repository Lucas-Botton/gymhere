import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp, withGymOverride } from '../../store/app';
import { addEquipmentRemote, removeEquipmentRemote } from '../../lib/gymsRepo';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';
import { MUSCLES, BRANDS } from '../../data/seed';

// The app's actual differentiator: the exact machines a member will find
// on-site, not just "musculation" as a tag. Grouped by muscle group since
// that's how members browse it on the public fiche (EquipmentTabs).
export default function GymEquipmentSheet({ visible, onClose, gymId }: { visible: boolean; onClose: () => void; gymId: string }) {
  const baseGym = useApp((s) => s.gyms.find((g) => g.id === gymId));
  const gymOverrides = useApp((s) => s.gymOverrides);
  const addEquipmentLocal = useApp((s) => s.addEquipmentLocal);
  const removeEquipmentLocal = useApp((s) => s.removeEquipmentLocal);
  const gym = baseGym ? withGymOverride(baseGym, gymOverrides) : null;
  const groups = gym?.groups ?? [];

  const [muscle, setMuscle] = useState(MUSCLES[0]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [qty, setQty] = useState('1');
  const kb = useKeyboardScrollFix();

  const add = async () => {
    const n = name.trim();
    const b = brand.trim() || '–';
    const q = Math.max(1, parseInt(qty, 10) || 1);
    if (!n) return;
    setName('');
    setQty('1');
    // Resolve the real row id (if Supabase is configured) before adding
    // locally, so the item is only ever added once — attaching the id
    // afterwards would mean a second, duplicate local add.
    const remoteId = await addEquipmentRemote(gymId, muscle, n, b, q);
    addEquipmentLocal(gymId, muscle, n, b, q, remoteId ?? undefined);
  };

  const remove = (group: string, index: number, itemId?: string) => {
    removeEquipmentLocal(gymId, group, index);
    if (itemId) removeEquipmentRemote(itemId);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mon équipement">
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: spacing.md }}>
          Les machines précises que tu as en salle — c'est ce qui aide le plus les pratiquants à choisir. Ajoute-les une par une, groupées par groupe musculaire.
        </Text>

        {groups.length === 0 ? (
          <Text weight="semibold" color={colors.textLight} style={{ fontSize: 12.5, marginBottom: spacing.md }}>
            Aucune machine renseignée pour l'instant.
          </Text>
        ) : (
          groups.map((g) => (
            <View key={g.group} style={{ marginBottom: spacing.md }}>
              <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
                {g.group}
              </Text>
              {g.items.map((it, i) => (
                <View key={i} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text weight="extrabold" style={{ fontSize: 13.5 }}>
                      {it.name}
                    </Text>
                    <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5 }}>
                      {it.brand} · x{it.qty}
                    </Text>
                  </View>
                  <Pressable onPress={() => remove(g.group, i, it.id)} hitSlop={8}>
                    <Text weight="black" color={colors.danger}>
                      ✕
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}

        <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.sm }}>
          Ajouter une machine
        </Text>

        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginBottom: 6 }}>
          Groupe musculaire
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {MUSCLES.map((m) => (
              <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(m)} />
            ))}
          </View>
        </ScrollView>

        <TextInput value={name} onChangeText={setName} placeholder="Nom de la machine (ex: Leg press)" placeholderTextColor={colors.textLight} style={styles.input} {...kb.inputProps} />

        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: spacing.sm, marginBottom: 6 }}>
          Marque
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {BRANDS.map((b) => (
              <Chip key={b} label={b} active={brand === b} onPress={() => setBrand(b)} />
            ))}
          </View>
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Autre marque..."
            placeholderTextColor={colors.textLight}
            style={[styles.input, { flex: 1 }]}
            {...kb.inputProps}
          />
          <TextInput
            value={qty}
            onChangeText={setQty}
            placeholder="Qté"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            style={[styles.input, { width: 70, textAlign: 'center' }]}
            {...kb.inputProps}
          />
        </View>

        <Button label="Ajouter la machine" variant="outline" onPress={add} style={{ marginTop: spacing.md }} />
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
    padding: spacing.sm,
    marginBottom: 6,
  },
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
});
