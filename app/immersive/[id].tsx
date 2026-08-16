import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import { IconBack } from '../../src/components/ui/icons';
import { colors, radius, spacing } from '../../src/theme';
import { findGym } from '../../src/data/seed';

const SCENES = [
  { name: 'Zone musculation', accent: '#F5397F' },
  { name: 'Espace cardio', accent: '#4F6EF7' },
  { name: 'Cross-training', accent: '#2FD4C0' },
  { name: 'Vestiaires & sauna', accent: '#8B5CFF' },
];

export default function Immersive() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gym = findGym(id);
  const [scene, setScene] = useState(0);
  const yaw = useRef(new Animated.Value(0)).current;
  const lastYaw = useRef(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        yaw.setValue(lastYaw.current + g.dx * 0.4);
      },
      onPanResponderRelease: (_, g) => {
        lastYaw.current += g.dx * 0.4;
      },
    })
  ).current;

  const bg = yaw.interpolate({ inputRange: [-400, 0, 400], outputRange: ['-40deg', '0deg', '40deg'] });

  return (
    <View style={styles.wrap}>
      <Animated.View
        {...pan.panHandlers}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: SCENES[scene].accent, opacity: 0.9, transform: [{ perspective: 800 }, { rotateY: bg }, { scale: 1.4 }] },
        ]}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} pointerEvents="none" />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.roundBtn}>
            <IconBack size={18} color="#fff" />
          </Pressable>
          <View style={styles.compass}>
            <Text weight="black" color="#fff" style={{ fontSize: 11 }}>
              {gym?.name ?? 'Salle'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.zoneRow}>
            {SCENES.map((s, i) => (
              <Pressable key={s.name} onPress={() => setScene(i)} style={[styles.zoneChip, i === scene && { backgroundColor: '#fff' }]}>
                <Text weight="extrabold" color={i === scene ? colors.ink : '#fff'} style={{ fontSize: 11.5 }}>
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.advanceBtn} onPress={() => setScene((s) => (s + 1) % SCENES.length)}>
            <Text weight="black" color="#fff" style={{ fontSize: 13.5 }}>
              Avancer dans la salle →
            </Text>
          </Pressable>
          <Text weight="semibold" color="rgba(255,255,255,0.6)" style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}>
            Fais glisser ton doigt pour regarder autour de toi
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roundBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  compass: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  bottomBar: { paddingBottom: spacing.lg },
  zoneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  zoneChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.2)' },
  advanceBtn: { backgroundColor: colors.pink, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
});
