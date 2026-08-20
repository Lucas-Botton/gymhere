import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import { Avatar, StarRating, Tag } from '../../src/components/ui/primitives';
import { GymCardCompact } from '../../src/components/gym/GymCards';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { GYMS } from '../../src/data/seed';
import { useApp } from '../../src/store/app';
import { useAllCoaches } from '../../src/lib/coaches';

export default function Favorites() {
  const [tab, setTab] = useState<'gyms' | 'coaches'>('gyms');
  const favGyms = useApp((s) => s.favGyms);
  const favCoaches = useApp((s) => s.favCoaches);
  const allCoaches = useAllCoaches();

  const gyms = GYMS.filter((g) => favGyms.includes(g.id));
  const coaches = allCoaches.filter((c) => favCoaches.includes(c.id));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Favoris
        </Text>
        <View style={styles.segment}>
          <Pressable onPress={() => setTab('gyms')} style={[styles.segmentBtn, tab === 'gyms' && styles.segmentBtnActive]}>
            <Text weight="extrabold" color={tab === 'gyms' ? colors.pink : colors.textMuted} style={{ fontSize: 13 }}>
              Salles ({gyms.length})
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab('coaches')} style={[styles.segmentBtn, tab === 'coaches' && styles.segmentBtnActive]}>
            <Text weight="extrabold" color={tab === 'coaches' ? colors.pink : colors.textMuted} style={{ fontSize: 13 }}>
              Coachs ({coaches.length})
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {tab === 'gyms' ? (
          gyms.length === 0 ? (
            <Empty text="Ajoute des salles en favoris pour les retrouver ici." />
          ) : (
            gyms.map((g) => <GymCardCompact key={g.id} gym={g} />)
          )
        ) : coaches.length === 0 ? (
          <Empty text="Ajoute des coachs en favoris pour les retrouver ici." />
        ) : (
          coaches.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/coach/${c.id}`)} style={[styles.coachCard, shadow.soft]}>
              <Avatar gradient={c.photo} size={56} initial={c.name[0]} uri={c.photoUri} />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <Text weight="black" style={{ fontSize: 14.5 }} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
                  <StarRating rating={c.rating} size={10} /> {c.rating} · {c.zone}
                </Text>
                <View style={styles.tagsRow}>
                  {c.specs.map((s) => (
                    <Tag key={s} label={s} />
                  ))}
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40 }}>🤍</Text>
      <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5, textAlign: 'center', marginTop: spacing.md }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  segment: { flexDirection: 'row', backgroundColor: colors.bgTint, borderRadius: radius.pill, padding: 3, marginTop: spacing.md },
  segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 38, borderRadius: radius.pill },
  segmentBtnActive: { backgroundColor: '#fff' },
  coachCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: spacing.xxl * 2, paddingHorizontal: spacing.xl },
});
