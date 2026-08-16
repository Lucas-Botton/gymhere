import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import { Avatar, StarRating, Tag } from '../../src/components/ui/primitives';
import { IconExplore, IconHeart } from '../../src/components/ui/icons';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { COACHES, SPECS } from '../../src/data/seed';
import { normalize } from '../../src/lib/filters';
import { useApp } from '../../src/store/app';

export default function Coaches() {
  const [query, setQuery] = useState('');
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);
  const favCoaches = useApp((s) => s.favCoaches);
  const toggleFavCoach = useApp((s) => s.toggleFavCoach);

  const toggleSpec = (s: string) => setActiveSpecs((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return COACHES.filter((c) => (activeSpecs.length === 0 || c.specs.some((s) => activeSpecs.includes(s))))
      .filter((c) => q === '' || normalize(`${c.name} ${c.zone} ${c.specs.join(' ')}`).includes(q));
  }, [query, activeSpecs]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Coachs
        </Text>
        <View style={styles.searchBar}>
          <IconExplore size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nom, zone, spécialité..."
            placeholderTextColor={colors.textLight}
            style={styles.input}
          />
        </View>
        <FlatList
          data={SPECS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s}
          contentContainerStyle={{ gap: 8, paddingVertical: spacing.sm }}
          renderItem={({ item }) => {
            const on = activeSpecs.includes(item);
            return (
              <Pressable onPress={() => toggleSpec(item)} style={[styles.chip, on && styles.chipActive]}>
                <Text weight="extrabold" color={on ? '#fff' : '#6B6478'} style={{ fontSize: 12 }}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => {
          const isFav = favCoaches.includes(item.id);
          return (
            <Pressable onPress={() => router.push(`/coach/${item.id}`)} style={[styles.card, shadow.soft]}>
              <Avatar gradient={item.photo} size={64} initial={item.name[0]} />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <Text weight="black" style={{ fontSize: 15.5 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12, marginTop: 2 }}>
                  <StarRating rating={item.rating} size={11} /> {item.rating} ({item.reviews}) · {item.zone}
                </Text>
                <View style={styles.tagsRow}>
                  {item.specs.map((s) => (
                    <Tag key={s} label={s} />
                  ))}
                </View>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavCoach(item.id);
                }}
                hitSlop={10}
              >
                <IconHeart size={19} color={isFav ? colors.pink : colors.textLight} filled={isFav} />
              </Pressable>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text weight="semibold" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Aucun coach ne correspond à ta recherche.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bgTint,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  input: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
});
