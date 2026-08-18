import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import GradientBlock, { GradientKey } from '../ui/GradientBlock';
import { colors, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { SPECS } from '../../data/seed';

const PHOTO_OPTIONS: GradientKey[] = ['pinkViolet', 'violetBlue', 'blueMint', 'coralPink'];

export default function PresentationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const draft = useApp((s) => s.coachDraft);
  const update = useApp((s) => s.updateCoachDraft);
  const [bio, setBio] = useState(draft.bio);
  const [specs, setSpecs] = useState<string[]>(draft.specs);
  const [photo, setPhoto] = useState(draft.photo);

  useEffect(() => {
    if (visible) {
      setBio(draft.bio);
      setSpecs(draft.specs);
      setPhoto(draft.photo);
    }
  }, [visible]);

  const toggleSpec = (s: string) => {
    setSpecs((a) => (a.includes(s) ? a.filter((x) => x !== s) : a.length < 3 ? [...a, s] : a));
  };

  const save = () => {
    update({ bio, specs, photo });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Ma présentation">
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: spacing.sm }}>
          Photo de profil
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.lg }}>
          {PHOTO_OPTIONS.map((p) => (
            <Pressable key={p} onPress={() => setPhoto(p)}>
              <GradientBlock kind={p} style={[styles.photoDot, photo === p && styles.photoDotActive]} />
            </Pressable>
          ))}
        </View>

        <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: spacing.sm }}>
          Bio
        </Text>
        <TextInput value={bio} onChangeText={setBio} multiline placeholder="Parle de ton parcours, ton approche..." placeholderTextColor={colors.textLight} style={styles.textarea} />

        <Text weight="extrabold" style={{ fontSize: 12.5, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Spécialités (max 3)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SPECS.map((s) => (
            <Chip key={s} label={s} active={specs.includes(s)} onPress={() => toggleSpec(s)} />
          ))}
        </View>

        <Button label="Enregistrer" onPress={save} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  photoDot: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: 'transparent' },
  photoDotActive: { borderColor: colors.pink },
  textarea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
