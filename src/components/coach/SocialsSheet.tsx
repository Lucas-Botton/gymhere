import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { colors, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';

const FIELDS: Array<{ key: 'instagram' | 'tiktok' | 'youtube' | 'linkedin'; label: string; placeholder: string }> = [
  { key: 'instagram', label: 'Instagram', placeholder: '@toncompte' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@toncompte' },
  { key: 'youtube', label: 'YouTube', placeholder: 'Lien de la chaîne' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'Lien du profil' },
];

export default function SocialsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const socials = useApp((s) => s.coachDraft.socials);
  const update = useApp((s) => s.updateCoachDraft);
  const [local, setLocal] = useState(socials);
  const kb = useKeyboardScrollFix();

  useEffect(() => {
    if (visible) setLocal(socials);
  }, [visible]);

  const save = () => {
    update({ socials: local });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mes réseaux">
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        {FIELDS.map((f) => (
          <View key={f.key} style={{ marginBottom: spacing.md }}>
            <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
              {f.label}
            </Text>
            <TextInput
              value={local[f.key] ?? ''}
              onChangeText={(v) => setLocal((s) => ({ ...s, [f.key]: v }))}
              placeholder={f.placeholder}
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              style={styles.input}
              {...kb.inputProps}
            />
          </View>
        ))}
        <Button label="Enregistrer" onPress={save} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: { height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
});
