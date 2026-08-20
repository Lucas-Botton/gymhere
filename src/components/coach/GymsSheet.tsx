import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { GYMS } from '../../data/seed';
import { normalize } from '../../lib/filters';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';

export default function GymsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const gymIds = useApp((s) => s.coachDraft.gymIds);
  const update = useApp((s) => s.updateCoachDraft);
  const [query, setQuery] = useState('');
  const kb = useKeyboardScrollFix();

  const toggle = (id: string) => update({ gymIds: gymIds.includes(id) ? gymIds.filter((x) => x !== id) : [...gymIds, id] });

  const results = GYMS.filter((g) => normalize(g.name).includes(normalize(query)));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Salles où j’interviens">
      <ScrollView
        {...kb.scrollProps}
        style={{ paddingHorizontal: spacing.xl }}
        contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une salle..."
          placeholderTextColor={colors.textLight}
          style={styles.input}
          {...kb.inputProps}
        />
        <View style={{ marginTop: spacing.md }}>
          {results.map((g) => {
            const on = gymIds.includes(g.id);
            return (
              <Pressable key={g.id} onPress={() => toggle(g.id)} style={[styles.row, on && { backgroundColor: colors.bgTint2 }]}>
                <Text weight="extrabold" style={{ fontSize: 14, flex: 1 }}>
                  {g.name}
                </Text>
                {on ? (
                  <Text weight="black" color={colors.pink}>
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: { height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.sm, borderRadius: radius.md },
});
