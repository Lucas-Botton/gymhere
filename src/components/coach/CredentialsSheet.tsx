import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { VerifiedPill } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';

export default function CredentialsSheet({
  visible,
  onClose,
  kind,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  kind: 'diplomas' | 'certifs';
  title: string;
}) {
  const list = useApp((s) => s.coachDraft[kind]);
  const addCredential = useApp((s) => s.addCredential);
  const removeCredential = useApp((s) => s.removeCredential);
  const [draft, setDraft] = useState('');
  const kb = useKeyboardScrollFix();

  const add = () => {
    addCredential(kind, draft);
    setDraft('');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginBottom: spacing.md }}>
          Ajoute librement ce que tu as obtenu. Chaque entrée passe en vérification par l’équipe gymhere.
        </Text>
        {list.map((c) => (
          <View key={c.label} style={styles.row}>
            <Text weight="extrabold" style={{ fontSize: 13.5, flex: 1 }}>
              {c.label}
            </Text>
            <VerifiedPill verified={c.verified} />
            <Pressable onPress={() => removeCredential(kind, c.label)} style={{ marginLeft: spacing.sm }}>
              <Text weight="black" color={colors.danger}>
                ✕
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.lg }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ex : BPJEPS AGFF"
            placeholderTextColor={colors.textLight}
            style={[styles.input, { flex: 1 }]}
            {...kb.inputProps}
          />
          <Button label="Ajouter" size="sm" onPress={add} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
});
