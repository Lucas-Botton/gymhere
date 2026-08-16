import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';

const GRADIENTS = ['pinkViolet', 'blueMint', 'coralPink', 'violetBlue', 'pinkViolet'] as const;

export default function GallerySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const count = useApp((s) => s.coachDraft.galleryCount);
  const update = useApp((s) => s.updateCoachDraft);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Galerie photos">
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginBottom: spacing.md }}>
          Ajoute des photos de toi en séance pour rassurer les pratiquants.
        </Text>
        <View style={styles.grid}>
          {Array.from({ length: count }).map((_, i) => (
            <GradientBlock key={i} kind={GRADIENTS[i % GRADIENTS.length]} style={styles.cell} />
          ))}
          <Pressable onPress={() => update({ galleryCount: count + 1 })} style={[styles.cell, styles.addCell]}>
            <Text weight="black" color={colors.pink} style={{ fontSize: 22 }}>
              +
            </Text>
          </Pressable>
        </View>
        {count > 0 ? (
          <Pressable onPress={() => update({ galleryCount: Math.max(0, count - 1) })} style={{ marginTop: spacing.md }}>
            <Text weight="extrabold" color={colors.danger} style={{ fontSize: 13 }}>
              Retirer la dernière photo
            </Text>
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31%', aspectRatio: 1, borderRadius: radius.md },
  addCell: { backgroundColor: colors.bgTint, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
});
