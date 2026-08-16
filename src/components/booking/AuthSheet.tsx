import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { useSession } from '../../store/session';
import { useApp } from '../../store/app';
import { colors, spacing } from '../../theme';
import { isSupabaseConfigured, sendEmailOtp, verifyEmailOtp, signInWithOAuth } from '../../lib/auth';

export default function AuthSheet() {
  const { authOpen, authActionLabel, closeAuth, login, syncFromSupabase } = useSession();
  const showToast = useApp((s) => s.showToast);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [loading, setLoading] = useState<'google' | 'apple' | 'email' | null>(null);

  const reset = () => {
    setStep('form');
    setCode('');
    setLoading(null);
  };

  const close = () => {
    reset();
    closeAuth();
  };

  const withOAuth = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured) {
      login({ name: 'Alex' });
      return;
    }
    setLoading(provider);
    try {
      const session = await signInWithOAuth(provider);
      syncFromSupabase(session?.user ?? null);
    } catch (e: any) {
      showToast(e?.message ?? 'Connexion impossible, réessaie.');
    } finally {
      setLoading(null);
    }
  };

  const submitEmail = async () => {
    if (!isSupabaseConfigured) {
      login({ name: name || 'Alex', email: email || undefined });
      return;
    }
    if (!email.includes('@')) return;
    setLoading('email');
    try {
      await sendEmailOtp(email);
      setStep('code');
    } catch (e: any) {
      showToast(e?.message ?? 'Envoi du code impossible.');
    } finally {
      setLoading(null);
    }
  };

  const submitCode = async () => {
    if (code.length < 4) return;
    setLoading('email');
    try {
      const session = await verifyEmailOtp(email, code);
      syncFromSupabase(session?.user ?? null);
      reset();
    } catch (e: any) {
      showToast(e?.message ?? 'Code invalide.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <BottomSheet visible={authOpen} onClose={close}>
      <View style={styles.wrap}>
        <Text weight="black" style={{ fontSize: 20, textAlign: 'center' }}>
          {step === 'code' ? 'Vérifie ton e-mail' : 'Crée ton compte'}
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 6 }}>
          {step === 'code'
            ? `On t’a envoyé un code à ${email}.`
            : authActionLabel
            ? `Pour ${authActionLabel}, connecte-toi en quelques secondes.`
            : 'Connecte-toi pour continuer.'}
        </Text>

        <View style={{ height: spacing.xl }} />

        {step === 'form' ? (
          <>
            <Button label="Continuer avec Google" variant="outline" loading={loading === 'google'} onPress={() => withOAuth('google')} />
            <View style={{ height: spacing.sm }} />
            <Button label="Continuer avec Apple" variant="dark" loading={loading === 'apple'} onPress={() => withOAuth('apple')} />
            <View style={{ height: spacing.lg }} />
            {!isSupabaseConfigured ? (
              <TextInput value={name} onChangeText={setName} placeholder="Ton prénom" placeholderTextColor={colors.textLight} style={styles.input} />
            ) : null}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, !isSupabaseConfigured && { marginTop: spacing.sm }]}
            />
            <View style={{ height: spacing.sm }} />
            <Button label="Continuer avec e-mail" loading={loading === 'email'} onPress={submitEmail} />
          </>
        ) : (
          <>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Code à 6 chiffres"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              style={styles.input}
            />
            <View style={{ height: spacing.sm }} />
            <Button label="Valider" loading={loading === 'email'} onPress={submitCode} />
          </>
        )}

        <Text weight="semibold" color={colors.textLight} style={{ fontSize: 11, textAlign: 'center', marginTop: spacing.lg }}>
          En continuant, tu acceptes les CGU et la politique de confidentialité de gymhere.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
});
