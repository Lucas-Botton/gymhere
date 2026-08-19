import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import Tap from '../../src/components/ui/Tap';
import GradientBlock from '../../src/components/ui/GradientBlock';
import Glass from '../../src/components/ui/Glass';
import { Avatar } from '../../src/components/ui/primitives';
import { IconBell, IconExplore, IconFilter, IconList, IconMap, IconStar } from '../../src/components/ui/icons';
import { GymCardFeatured, GymCardCompact } from '../../src/components/gym/GymCards';
import GymMap from '../../src/components/gym/GymMap';
import FiltersSheet from '../../src/components/gym/FiltersSheet';
import GoalPickerSheet from '../../src/components/gym/GoalPickerSheet';
import SearchOverlay from '../../src/components/gym/SearchOverlay';
import { colors, radius, shadow, shadowBleed, spacing } from '../../src/theme';
import { GYMS, GOALS } from '../../src/data/seed';
import { activeFilterCount, gymDistanceKm, gymPassesFilters } from '../../src/lib/filters';
import { useApp } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import { useLocationStore } from '../../src/store/location';

export default function Explore() {
  const { city } = useSession();
  const { filters, goal, goalDismissed, dismissGoal } = useApp();
  const coords = useLocationStore((s) => s.coords);
  const [mapView, setMapView] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);

  const filtered = useMemo(() => GYMS.filter((g) => gymPassesFilters(g, filters, coords)), [filters, coords]);
  const sponsored = filtered.filter((g) => g.sponsored);
  const others = useMemo(
    () =>
      filtered
        .filter((g) => !g.sponsored)
        .slice()
        .sort((a, b) => (coords ? gymDistanceKm(a, coords) - gymDistanceKm(b, coords) : 0)),
    [filtered, coords]
  );
  const filterCount = activeFilterCount(filters);

  const activeGoal = GOALS.find((g) => g.key === goal) ?? null;
  const recoGyms = activeGoal ? filtered.filter((g) => activeGoal.gymIds.includes(g.id)).slice(0, 3) : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GradientBlock kind="brand" style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <Glass variant="light" style={styles.cityPill}>
              <Text weight="extrabold" color="#fff" style={{ fontSize: 12.5 }}>
                📍 {city}
              </Text>
            </Glass>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
                <Glass variant="light" style={styles.iconBtn}>
                  <IconBell size={19} color="#fff" />
                </Glass>
                {unread > 0 ? <View style={styles.dot} /> : null}
              </Pressable>
              <Pressable onPress={() => router.push('/(member)/profile')}>
                <Avatar size={34} gradient="blueMint" initial="A" />
              </Pressable>
            </View>
          </View>
          <Text weight="black" color="#fff" style={{ fontSize: 21, marginTop: spacing.md }}>
            Salut 👋 on s’entraîne où ?
          </Text>
          <Tap onPress={() => setSearchOpen(true)} style={[styles.searchBar, shadow.card]}>
            <IconExplore size={16} color={colors.textMuted} />
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5 }}>
              Machine, marque, salle, quartier...
            </Text>
          </Tap>
        </SafeAreaView>
      </GradientBlock>

      <View style={styles.toolbar}>
        <View style={styles.segment}>
          <Tap onPress={() => setMapView(false)} style={[styles.segmentBtn, !mapView && styles.segmentBtnActive]}>
            <IconList size={15} color={!mapView ? colors.pink : colors.textMuted} />
            <Text weight="extrabold" color={!mapView ? colors.pink : colors.textMuted} style={{ fontSize: 12.5 }}>
              Liste
            </Text>
          </Tap>
          <Tap onPress={() => setMapView(true)} style={[styles.segmentBtn, mapView && styles.segmentBtnActive]}>
            <IconMap size={16} color={mapView ? colors.pink : colors.textMuted} />
            <Text weight="extrabold" color={mapView ? colors.pink : colors.textMuted} style={{ fontSize: 12.5 }}>
              Carte
            </Text>
          </Tap>
        </View>
        <Pressable
          onPress={() => setGoalOpen(true)}
          style={[
            styles.pillBtn,
            styles.pillBtnGoal,
            activeGoal && { backgroundColor: activeGoal.colors[0] + '1A', borderColor: activeGoal.colors[0] },
          ]}
          hitSlop={4}
        >
          <Text style={{ fontSize: 16 }}>{activeGoal?.emoji ?? '🎯'}</Text>
        </Pressable>
        <Pressable onPress={() => setFiltersOpen(true)} style={styles.pillBtn} hitSlop={4}>
          <IconFilter size={15} color={colors.ink} />
          <Text weight="extrabold" color={colors.ink} numberOfLines={1} style={{ fontSize: 12.5 }}>
            Filtres{filterCount > 0 ? ` · ${filterCount}` : ''}
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Tap onPress={() => router.push('/compare')} style={[{ borderRadius: radius.lg }, shadow.soft]}>
          <LinearGradient colors={[colors.equipBg, colors.successBg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.compareBtn}>
            <Text style={{ fontSize: 15 }}>⇄</Text>
            <Text weight="extrabold" color={colors.violet} style={{ fontSize: 13.5 }}>
              Comparer les salles côte à côte
            </Text>
          </LinearGradient>
        </Tap>
      </View>

      {mapView ? (
        <GymMap gyms={filtered} />
      ) : (
        <FlatList
          data={others}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => <GymCardCompact gym={item} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {!goal && !goalDismissed ? (
                <View style={[styles.goalBanner, shadow.glowViolet]}>
                  <GradientBlock kind="pinkViolet" style={styles.goalIcon}>
                    <Text style={{ fontSize: 18 }}>🎯</Text>
                  </GradientBlock>
                  <View style={{ flex: 1 }}>
                    <Text weight="extrabold" color="#fff" style={{ fontSize: 13.5 }}>
                      C’est quoi ton objectif ?
                    </Text>
                    <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 11.5, marginTop: 2 }}>
                      On met en avant les salles adaptées, sans rien te cacher.
                    </Text>
                  </View>
                  <Pressable onPress={() => setGoalOpen(true)} style={styles.goalBannerBtn}>
                    <Text weight="black" color={colors.pink} style={{ fontSize: 12 }}>
                      Choisir
                    </Text>
                  </Pressable>
                  <Pressable onPress={dismissGoal} hitSlop={8} style={{ marginLeft: 6 }}>
                    <Text weight="black" color="rgba(255,255,255,0.8)">
                      ✕
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {activeGoal && recoGyms.length > 0 ? (
                <View style={{ marginBottom: spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.sm }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: activeGoal.colors[0] }} />
                    <Text weight="black" color={activeGoal.colors[0]} style={{ fontSize: 15.5 }}>
                      {activeGoal.emoji} Pour ton objectif
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: shadowBleed, paddingLeft: shadowBleed, paddingRight: spacing.md }}
                    style={{ marginVertical: -shadowBleed, marginLeft: -shadowBleed }}
                  >
                    {recoGyms.map((g) => (
                      <GymCardFeatured key={g.id} gym={g} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {sponsored.length > 0 ? (
                <View style={{ marginBottom: spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
                    <IconStar size={14} color={colors.pink} />
                    <Text weight="black" style={{ fontSize: 15.5 }}>
                      Mises en avant
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: shadowBleed, paddingLeft: shadowBleed, paddingRight: spacing.md }}
                    style={{ marginVertical: -shadowBleed, marginLeft: -shadowBleed }}
                  >
                    {sponsored.map((g) => (
                      <GymCardFeatured key={g.id} gym={g} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <Text weight="black" style={{ fontSize: 15.5, marginBottom: spacing.sm }}>
                Autour de toi
              </Text>
            </>
          }
          ListEmptyComponent={
            <Text weight="semibold" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
              Aucune salle ne correspond à ces filtres pour l’instant.
            </Text>
          }
        />
      )}

      <FiltersSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <GoalPickerSheet visible={goalOpen} onClose={() => setGoalOpen(false)} />
      <SearchOverlay visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  cityPill: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD84D', borderWidth: 1.5, borderColor: '#fff' },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: radius.lg,
    paddingVertical: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  segment: { flexDirection: 'row', backgroundColor: colors.bgTint, borderRadius: radius.pill, padding: 3, flex: 1 },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 34, borderRadius: radius.pill },
  segmentBtnActive: { backgroundColor: '#fff' },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: 6,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  pillBtnGoal: { width: 40, paddingHorizontal: 0 },
  pillBtnActive: { backgroundColor: colors.bgTint2, borderColor: '#EEDCF0' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  goalIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  goalBannerBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
});
