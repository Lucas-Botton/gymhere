import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Image } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import GradientBlock, { GradientKey } from '../ui/GradientBlock';
import { colors, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';
import { pickProfilePhoto } from '../../lib/imagePicker';
import { SPECS } from '../../data/seed';

const PHOTO_OPTIONS: GradientKey[] = ['pinkViolet', 'violetBlue', 'blueMint', 'coralPink'];

export default function PresentationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const draft = useApp((s) => s.coachDraft);
  const update = useApp((s) => s.updateCoachDraft);
  const [bio, setBio] = useState(draft.bio);
  const [zone, setZone] = useState(draft.zone);
  const [specs, setSpecs] = useState<string[]>(draft.specs);
  const [photo, setPhoto] = useState(draft.photo);
  const [photoUri, setPhotoUri] = useState(draft.photoUri);
  const kb = useKeyboardScrollFix();

  useEffect(() => {
    if (visible) {
      setBio(draft.bio);
      setZone(draft.zone);
      setSpecs(draft.specs);
      setPhoto(draft.photo);
      setPhotoUri(draft.photoUri);
    }
  }, [visible]);

  const toggleSpec = (s: string) => {
    setSpecs((a) => (a.includes(s) ? a.filter((x) => x !== s) : a.length < 3 ? [...a, s] : a));
  };

  const changePhoto = async () => {
    const uri = await pickProfilePhoto();
    if (uri) setPhotoUri(uri);
  };

  const save = () => {
    update({ bio, zone, specs, photo, photoUri });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Ma présentation">
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: spacing.sm }}>
          Photo de profil
        </Text>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Pressable onPress={changePhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.bigPhoto} />
            ) : (
              <GradientBlock kind={photo} style={styles.bigPhoto} />
            )}
            <View style={styles.photoEditBadge}>
              <Text style={{ fontSize: 12 }}>✎</Text>
            </View>
          </Pressable>
          <Pressable onPress={changePhoto} hitSlop={6} style={{ marginTop: 8 }}>
            <Text weight="extrabold" color={colors.pink} style={{ fontSize: 12.5 }}>
              {photoUri ? 'Changer la photo' : 'Ajouter une photo'}
            </Text>
          </Pressable>
        </View>

        <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11.5, marginBottom: spacing.sm }}>
          Sans photo, choisis une couleur
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.lg }}>
          {PHOTO_OPTIONS.map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                setPhoto(p);
                setPhotoUri(undefined);
              }}
            >
              <GradientBlock kind={p} style={[styles.photoDot, !photoUri && photo === p && styles.photoDotActive]} />
            </Pressable>
          ))}
        </View>

        <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: spacing.sm }}>
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Parle de ton parcours, ton approche..."
          placeholderTextColor={colors.textLight}
          style={styles.textarea}
          {...kb.inputProps}
        />

        <Text weight="extrabold" style={{ fontSize: 12.5, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Zone d’intervention
        </Text>
        <TextInput value={zone} onChangeText={setZone} placeholder="Ex : Presqu’île, Lyon 7e..." placeholderTextColor={colors.textLight} style={styles.input} {...kb.inputProps} />

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
  bigPhoto: { width: 92, height: 92, borderRadius: 46 },
  photoEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDot: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: 'transparent' },
  photoDotActive: { borderColor: colors.pink },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13.5,
    color: colors.ink,
  },
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
