import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import { colors, radius, spacing } from '../src/theme';
import { useSession } from '../src/store/session';
import { useApp } from '../src/store/app';

export default function CoachSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [certify, setCertify] = useState(false);
  const { becomeCoach, login } = useSession();
  const updateCoachDraft = useApp((s) => s.updateCoachDraft);

  const canSubmit = name.trim().length > 1 && email.includes('@') && phone.trim().length > 5 && password.length >= 6 && certify;

  const submit = () => {
    login({ name });
    becomeCoach();
    updateCoachDraft({ name });
    router.replace('/(coach)/ma-fiche');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Compte coach" onBack={() => router.replace('/role-choice')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text weight="black" style={{ fontSize: 21 }}>
          Crée ton compte pro
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5, marginTop: 6, marginBottom: spacing.xl }}>
          Un abonnement sera nécessaire pour publier ta fiche, mais tu peux tout préparer dès maintenant.
        </Text>

        <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Léa Dubois" />
        <Field label="Email pro" value={email} onChangeText={setEmail} placeholder="contact@toncoaching.fr" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 12 34 56 78" keyboardType="phone-pad" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères minimum" secureTextEntry />

        <Pressable onPress={() => setCertify((v) => !v)} style={styles.checkRow}>
          <View style={[styles.checkbox, certify && { backgroundColor: colors.pink, borderColor: colors.pink }]}>
            {certify ? (
              <Text weight="black" color="#fff" style={{ fontSize: 12 }}>
                ✓
              </Text>
            ) : null}
          </View>
          <Text weight="semibold" color={colors.ink} style={{ fontSize: 13, flex: 1 }}>
            Je certifie être un professionnel du coaching sportif.
          </Text>
        </Pressable>

        <Button label="Créer mon compte pro" onPress={submit} disabled={!canSubmit} style={{ marginTop: spacing.xl }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
        {props.label}
      </Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
