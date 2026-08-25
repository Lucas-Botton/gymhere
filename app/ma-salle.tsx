import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import GradientBlock from '../src/components/ui/GradientBlock';
import { colors, radius, spacing } from '../src/theme';
import { useApp, withGymOverride } from '../src/store/app';
import { useSession } from '../src/store/session';
import { updateGymRemote } from '../src/lib/gymsRepo';

// Self-service gym back-office (free tier — see the pricing note): a
// claimed gym's owner edits the fields that actually go stale fast
// (horaires, contact) directly here. Identity fields (name, category,
// location, photo) stay gymhere-controlled for v1, so this form is
// deliberately short rather than a full copy of the coach "Ma fiche".
export default function MaSalle() {
  const ownedGymId = useSession((s) => s.ownedGymId);
  const gyms = useApp((s) => s.gyms);
  const gymOverrides = useApp((s) => s.gymOverrides);
  const updateGymOverride = useApp((s) => s.updateGymOverride);
  const showToast = useApp((s) => s.showToast);

  const baseGym = gyms.find((g) => g.id === ownedGymId);
  const gym = baseGym ? withGymOverride(baseGym, gymOverrides) : null;

  const [hours, setHours] = useState(gym?.hours ?? '');
  const [hoursSub, setHoursSub] = useState(gym?.hoursSub ?? '');
  const [phone, setPhone] = useState(gym?.phone ?? '');
  const [website, setWebsite] = useState(gym?.website ?? '');

  if (!gym) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScreenHeader title="Ma salle" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Text weight="extrabold" style={{ fontSize: 15, textAlign: 'center' }}>
            Tu ne gères encore aucune salle.
          </Text>
          <Button label="Revendiquer ma salle" onPress={() => router.push('/claim-gym')} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  const save = () => {
    updateGymOverride(gym.id, { hours, hoursSub, phone, website });
    updateGymRemote(gym.id, { hours, hoursSub, phone, website });
    showToast('Fiche mise à jour');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScreenHeader title="Ma salle" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <GradientBlock kind={gym.photo} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text weight="black" style={{ fontSize: 16 }}>
                {gym.name}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 2 }}>
                {gym.address}
              </Text>
            </View>
          </View>

          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, lineHeight: 18, marginTop: spacing.md }}>
            Ces informations sont visibles immédiatement par tous les pratiquants qui consultent ta fiche.
          </Text>

          <Field label="Horaires" value={hours} onChangeText={setHours} placeholder="Lun–Ven 8h–21h" />
          <Field label="Précision horaires" value={hoursSub} onChangeText={setHoursSub} placeholder="Sam 9h–13h · Dim fermé" />
          <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="04 78 00 00 00" keyboardType="phone-pad" />
          <Field label="Site web" value={website} onChangeText={setWebsite} placeholder="https://..." autoCapitalize="none" keyboardType="url" />

          <Button label="Enregistrer" onPress={save} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 48, height: 48, borderRadius: 14 },
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
});
