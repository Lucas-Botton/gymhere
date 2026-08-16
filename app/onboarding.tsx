import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import GradientBlock from '../src/components/ui/GradientBlock';
import BottomSheet from '../src/components/ui/BottomSheet';
import { colors, radius, spacing } from '../src/theme';
import { useSession } from '../src/store/session';

const CITIES = [
  { name: 'Lyon', live: true },
  { name: 'Paris', live: false },
  { name: 'Marseille', live: false },
  { name: 'Bordeaux', live: false },
  { name: 'Lille', live: false },
  { name: 'Toulouse', live: false },
];

export default function Onboarding() {
  const [step, setStep] = useState<'ask' | 'locating' | 'outzone'>('ask');
  const [cityPicker, setCityPicker] = useState(false);
  const [outzoneCity, setOutzoneCity] = useState('ta ville');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { setCity, setHasOnboarded } = useSession();

  const activatePosition = async () => {
    setStep('locating');
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {}
    setTimeout(() => {
      setCity('Lyon');
      setHasOnboarded(true);
      router.replace('/role-choice');
    }, 1500);
  };

  const pickCity = (c: (typeof CITIES)[number]) => {
    setCityPicker(false);
    if (c.live) {
      setCity(c.name);
      setHasOnboarded(true);
      router.replace('/role-choice');
    } else {
      setOutzoneCity(c.name);
      setStep('outzone');
    }
  };

  const exploreAnyway = () => {
    setCity('Lyon');
    setHasOnboarded(true);
    router.replace('/role-choice');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GradientBlock kind="brand" style={styles.mapPreview}>
        <SafeAreaView style={styles.mapContent}>
          <Pressable style={styles.cityBadge} onPress={() => setCityPicker(true)}>
            <Text weight="extrabold" style={{ fontSize: 13 }}>
              📍 Lyon
            </Text>
            <Text weight="black" color={colors.textMuted} style={{ fontSize: 10 }}>
              ▾
            </Text>
          </Pressable>
          <View style={styles.activeBadge}>
            <View style={styles.pulseDot} />
            <Text weight="extrabold" color="#fff" style={{ fontSize: 12 }}>
              128 salles actives
            </Text>
          </View>
        </SafeAreaView>
      </GradientBlock>

      <View style={styles.sheet}>
        {step === 'ask' && (
          <>
            <Text weight="black" style={{ fontSize: 24, textAlign: 'center' }}>
              Trouve ta salle idéale
            </Text>
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14.5, textAlign: 'center', marginTop: 8, paddingHorizontal: 12 }}>
              Active ta position pour découvrir les salles et coachs les plus proches de toi à Lyon.
            </Text>
            <View style={{ height: spacing.xl }} />
            <Button label="Activer ma position" size="lg" onPress={activatePosition} />
            <View style={{ height: spacing.sm }} />
            <Button label="Explorer Lyon sans partager ma position" size="lg" variant="ghost" onPress={exploreAnyway} />
          </>
        )}

        {step === 'locating' && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <ActivityIndicator size="large" color={colors.pink} />
            <Text weight="extrabold" style={{ fontSize: 15, marginTop: spacing.lg }}>
              On te repère...
            </Text>
          </View>
        )}

        {step === 'outzone' && (
          <>
            <Text weight="black" style={{ fontSize: 22, textAlign: 'center' }}>
              gymhere démarre à Lyon 🚀
            </Text>
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              On arrive bientôt à {outzoneCity}. Laisse-nous ton email pour être prévenu·e à l’ouverture.
            </Text>
            <View style={{ height: spacing.lg }} />
            {sent ? (
              <View style={styles.sentBox}>
                <Text weight="extrabold" color={colors.successDeep} style={{ fontSize: 14 }}>
                  Merci, on te préviendra ✓
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ton@email.com"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <View style={{ height: spacing.md }} />
                <Button label="Me prévenir à l’ouverture" disabled={!email.includes('@')} onPress={() => setSent(true)} />
              </>
            )}
            <View style={{ height: spacing.sm }} />
            <Button label="Explorer Lyon en attendant" variant="ghost" onPress={exploreAnyway} />
          </>
        )}
      </View>

      <BottomSheet visible={cityPicker} onClose={() => setCityPicker(false)} title="Choisis ta ville">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          {CITIES.map((c) => (
            <Pressable key={c.name} onPress={() => pickCity(c)} style={styles.cityRow}>
              <Text weight="extrabold" style={{ fontSize: 15 }}>
                {c.name}
              </Text>
              <View style={[styles.cityTag, { backgroundColor: c.live ? colors.successBg : colors.bgTint }]}>
                <Text weight="extrabold" color={c.live ? colors.successDeep : colors.textMuted} style={{ fontSize: 11 }}>
                  {c.live ? 'Disponible' : 'Bientôt'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: { height: '46%' },
  mapContent: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  cityBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,16,26,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mint },
  sheet: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: -24,
    backgroundColor: '#fff',
  },
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
  sentBox: { backgroundColor: colors.successBg, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cityTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
});
