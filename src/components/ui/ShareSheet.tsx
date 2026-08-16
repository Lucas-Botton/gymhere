import React from 'react';
import { View, StyleSheet, Pressable, Share } from 'react-native';
import BottomSheet from './BottomSheet';
import Text from './Text';
import { colors, radius, spacing } from '../../theme';

export default function ShareSheet({
  visible,
  onClose,
  targetName,
}: {
  visible: boolean;
  onClose: () => void;
  targetName: string;
}) {
  const doShare = async () => {
    try {
      await Share.share({ message: `Découvre ${targetName} sur gymhere` });
    } catch {}
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Partager ${targetName}`}>
      <View style={styles.wrap}>
        <Pressable onPress={doShare} style={styles.row}>
          <Text weight="extrabold" style={{ fontSize: 14.5 }}>
            Partager via...
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onClose();
          }}
          style={styles.row}
        >
          <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 14.5 }}>
            Copier le lien
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
});
