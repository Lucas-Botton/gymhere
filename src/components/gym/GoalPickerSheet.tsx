import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { GOALS } from '../../data/seed';

export default function GoalPickerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const goal = useApp((s) => s.goal);
  const setGoal = useApp((s) => s.setGoal);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="C’est quoi ton objectif ?">
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, marginBottom: spacing.lg }}>
          On met en avant les salles qui te correspondent le mieux. Toutes les autres restent bien sûr visibles.
        </Text>
        {GOALS.map((g) => {
          const active = goal === g.key;
          return (
            <Pressable
              key={g.key}
              onPress={() => {
                setGoal(g.key);
                onClose();
              }}
              style={[styles.row, active && { backgroundColor: colors.pink, borderColor: colors.pink }]}
            >
              <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
              <Text weight="extrabold" color={active ? '#fff' : colors.ink} style={{ fontSize: 14.5, flex: 1, marginLeft: spacing.md }}>
                {g.label}
              </Text>
              {active ? (
                <Text weight="black" color="#fff">
                  ✓
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        {goal ? (
          <Pressable
            onPress={() => {
              setGoal(null);
              onClose();
            }}
            style={{ alignSelf: 'center', marginTop: spacing.sm, padding: spacing.sm }}
          >
            <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 13 }}>
              Retirer mon objectif
            </Text>
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
