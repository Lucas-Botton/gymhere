import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import Text from '../src/components/ui/Text';
import { Wordmark } from '../src/components/ui/Logo';
import GradientBlock from '../src/components/ui/GradientBlock';
import BottomSheet from '../src/components/ui/BottomSheet';
import { IconLocationPin, IconChevronDown, IconBack, IconChevronRight } from '../src/components/ui/icons';
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

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 2.6, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mintDeep, transform: [{ scale }], opacity }} />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.mintDeep }} />
    </View>
  );
}

function RadarRing({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.6, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.radarRing, { transform: [{ scale }], opacity }]} />;
}

export default function Onboarding() {
  const [step, setStep] = useState<'ask' | 'locating' | 'outzone'>('ask');
  const [cityPicker, setCityPicker] = useState(false);
  const [outzoneCity, setOutzoneCity] = useState('ta ville');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { city, setCity, setHasOnboarded } = useSession();

  const activatePosition = async () => {
    setStep('locating');
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {}
    setTimeout(() => {
      setCity('Lyon');
      setHasOnboarded(true);
      router.replace('/role-choice');
    }, 1600);
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
    <GradientBlock kind="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
        {step === 'ask' && (
          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Wordmark size={26} />
              <Pressable onPress={() => setCityPicker(true)} style={styles.cityBadge}>
                <IconLocationPin size={14} color="#fff" />
                <Text weight="extrabold" color="#fff" style={{ fontSize: 13 }}>
                  {city}
                </Text>
                <IconChevronDown size={13} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.mapCard}>
              <GradientBlock kind="blueMint" style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}>
                <View style={styles.mapDot1} />
                <View style={styles.mapDot2} />
                <View style={styles.mapDot3} />
              </GradientBlock>
              <View style={styles.mapOverlay} />
              <View style={styles.mapBadge}>
                <PulseDot />
                <Text weight="extrabold" color="#fff" style={{ fontSize: 11.5 }}>
                  128 salles actives
                </Text>
              </View>
            </View>

            <Text weight="black" color="#fff" style={{ fontSize: 26, letterSpacing: -0.6, lineHeight: 30 }}>
              Toutes les salles &{'\n'}tous les coachs de Lyon.
            </Text>
            <Text weight="bold" color="rgba(255,255,255,0.88)" style={{ fontSize: 14.5, marginTop: 8, lineHeight: 21 }}>
              Active ta position pour comparer les salles autour de toi, et trouver celle qui a{' '}
              <Text weight="black" color="#fff">
                exactement
              </Text>{' '}
              le matériel qu’il te faut.
            </Text>

            <Pressable onPress={activatePosition} style={styles.ctaBtn}>
              <IconLocationPin size={18} color={colors.pink} />
              <Text weight="black" color={colors.pink} style={{ fontSize: 16 }}>
                Activer ma position
              </Text>
            </Pressable>
            <Pressable onPress={() => setCityPicker(true)} style={{ alignItems: 'center', paddingVertical: 10, marginTop: 4 }}>
              <Text weight="extrabold" color="rgba(255,255,255,0.92)" style={{ fontSize: 13.5 }}>
                Choisir ma ville manuellement
              </Text>
            </Pressable>
          </View>
        )}

        {step === 'locating' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.radarWrap}>
              <RadarRing delay={0} />
              <RadarRing delay={500} />
              <View style={styles.radarCore}>
                <IconLocationPin size={28} color={colors.pink} />
              </View>
            </View>
            <Text weight="black" color="#fff" style={{ fontSize: 20, marginTop: spacing.xl }}>
              On te localise…
            </Text>
            <Text weight="bold" color="rgba(255,255,255,0.85)" style={{ fontSize: 14, marginTop: 6 }}>
              Recherche des salles autour de toi
            </Text>
          </View>
        )}

        {step === 'outzone' && (
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => setStep('ask')} style={styles.backBtn}>
              <IconBack size={18} color="#fff" />
            </Pressable>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 48 }}>🚀</Text>
              <Text weight="black" color="#fff" style={{ fontSize: 25, letterSpacing: -0.5, marginTop: 12, lineHeight: 29 }}>
                <Text weight="regular" color="#fff" style={{ fontSize: 25 }}>
                  gym
                </Text>
                here démarre à Lyon
              </Text>
              <Text weight="bold" color="rgba(255,255,255,0.9)" style={{ fontSize: 14.5, marginTop: 10, lineHeight: 21 }}>
                On arrive bientôt à {outzoneCity} ! Laisse ton email pour être prévenu·e dès l’ouverture, tu seras dans les premiers.
              </Text>

              {sent ? (
                <View style={styles.sentBox}>
                  <View style={styles.sentCheck}>
                    <Text weight="black" color={colors.successDeep} style={{ fontSize: 15 }}>
                      ✓
                    </Text>
                  </View>
                  <View>
                    <Text weight="black" color="#fff" style={{ fontSize: 14.5 }}>
                      C’est noté !
                    </Text>
                    <Text weight="bold" color="rgba(255,255,255,0.85)" style={{ fontSize: 12.5 }}>
                      On te prévient dès qu’on ouvre à {outzoneCity}.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emailRow}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ton@email.com"
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.emailInput}
                  />
                  <Pressable onPress={() => email.includes('@') && setSent(true)} style={styles.notifyBtn}>
                    <Text weight="black" color="#fff" style={{ fontSize: 13.5 }}>
                      Me prévenir
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
            <Pressable onPress={exploreAnyway} style={styles.outlineBtn}>
              <Text weight="black" color="#fff" style={{ fontSize: 15 }}>
                Explorer Lyon en attendant
              </Text>
              <IconChevronRight size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      <BottomSheet visible={cityPicker} onClose={() => setCityPicker(false)} title="Choisis ta ville">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 13, marginTop: -8, marginBottom: spacing.md }}>
            gymhere s’étend ville par ville. Lyon est en ligne, les autres arrivent.
          </Text>
          {CITIES.map((c) => (
            <Pressable key={c.name} onPress={() => pickCity(c)} style={styles.cityRow}>
              <View style={[styles.cityIconBox, c.live && { backgroundColor: undefined }]}>
                {c.live ? (
                  <GradientBlock kind="pinkViolet" style={StyleSheet.absoluteFill} />
                ) : null}
                <IconLocationPin size={18} color={c.live ? '#fff' : colors.textLight} />
              </View>
              <Text weight="black" color={c.live ? colors.ink : colors.textMuted} style={{ fontSize: 15.5, flex: 1 }}>
                {c.name}
              </Text>
              <View style={[styles.cityTag, { backgroundColor: c.live ? colors.successBg : colors.bgTint2 }]}>
                <Text weight="extrabold" color={c.live ? colors.successDeep : colors.textLight} style={{ fontSize: 11.5 }}>
                  {c.live ? 'Disponible' : 'Bientôt'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </GradientBlock>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  mapCard: {
    flex: 1,
    marginVertical: spacing.lg,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,16,26,0.18)' },
  mapDot1: { position: 'absolute', left: '30%', top: '35%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  mapDot2: { position: 'absolute', left: '60%', top: '55%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', opacity: 0.8 },
  mapDot3: { position: 'absolute', left: '45%', top: '70%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', opacity: 0.8 },
  mapBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(20,16,26,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  ctaBtn: {
    marginTop: spacing.xl,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  radarWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  radarRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.18)' },
  radarCore: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  sentBox: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  sentCheck: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  emailRow: { flexDirection: 'row', gap: 9, marginTop: spacing.xl },
  emailInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    color: colors.ink,
  },
  notifyBtn: { backgroundColor: colors.ink, borderRadius: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  cityIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgTint2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cityTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
});
