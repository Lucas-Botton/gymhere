import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import { colors, radius, spacing } from '../src/theme';
import { useSession } from '../src/store/session';
import { useApp } from '../src/store/app';
import { isSupabaseConfigured, sendEmailOtp, verifyEmailOtp } from '../src/lib/auth';

export default function CoachSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [certify, setCertify] = useState(false);
  const [loading, setLoading] = useState(false);
  const { becomeCoach, login, syncFromSupabase, updateProfile } = useSession();
  const updateCoachDraft = useApp((s) => s.updateCoachDraft);
  const showToast = useApp((s) => s.showToast);

  const canSubmitForm = name.trim().length > 1 && email.includes('@') && phone.trim().length > 5 && certify;

  const enterApp = () => {
    becomeCoach();
    updateCoachDraft({ name });
    router.replace('/(coach)/ma-fiche');
  };

  // Sans projet Supabase branché (mode démo), pas de vraie session possible
  // — on garde le compte local, comme partout ailleurs dans l'app dans ce cas.
  const submitForm = async () => {
    if (!isSupabaseConfigured) {
      login({ name, phone });
      enterApp();
      return;
    }
    setLoading(true);
    try {
      await sendEmailOtp(email);
      setStep('code');
    } catch (e: any) {
      showToast(e?.message ?? 'Envoi du code impossible.');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (code.length < 4) return;
    setLoading(true);
    try {
      const session = await verifyEmailOtp(email, code);
      syncFromSupabase(session?.user ?? null);
      updateProfile({ name, phone });
      enterApp();
    } catch (e: any) {
      showToast(e?.message ?? 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Compte coach" onBack={() => (step === 'code' ? setStep('form') : router.replace('/role-choice'))} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          {step === 'form' ? (
            <>
              <Text weight="black" style={{ fontSize: 21 }}>
                Crée ton compte pro
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5, marginTop: 6, marginBottom: spacing.xl }}>
                Un abonnement sera nécessaire pour publier ta fiche, mais tu peux tout préparer dès maintenant.
              </Text>

              <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Léa Dubois" />
              <Field label="Email pro" value={email} onChangeText={setEmail} placeholder="contact@toncoaching.fr" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="06 12 34 56 78" keyboardType="phone-pad" />

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

              <Button
                label={isSupabaseConfigured ? 'Recevoir mon code par e-mail' : 'Créer mon compte pro'}
                onPress={submitForm}
                disabled={!canSubmitForm}
                loading={loading}
                style={{ marginTop: spacing.xl }}
              />
            </>
          ) : (
            <>
              <Text weight="black" style={{ fontSize: 21 }}>
                Vérifie ton e-mail
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5, marginTop: 6, marginBottom: spacing.xl }}>
                On t’a envoyé un code à {email}.
              </Text>

              <Field label="Code à 6 chiffres" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" />

              <Button label="Valider et créer mon compte" onPress={submitCode} disabled={code.length < 4} loading={loading} style={{ marginTop: spacing.xl }} />
              <Pressable onPress={() => setStep('form')} style={{ alignItems: 'center', marginTop: spacing.md }}>
                <Text weight="extrabold" color={colors.pink} style={{ fontSize: 13 }}>
                  Modifier mon e-mail
                </Text>
              </Pressable>
            </>
          )}
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
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
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
