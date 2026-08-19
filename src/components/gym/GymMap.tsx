import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Animated, Easing } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { router } from 'expo-router';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import Glass from '../ui/Glass';
import { CertifiedBadge, GymRatingMeta } from '../ui/primitives';
import { colors, radius, shadow, spacing } from '../../theme';
import { Gym } from '../../types';
import { ME_LOCATION } from '../../data/seed';
import { distanceLabel, gymDistanceKm, priceLabel } from '../../lib/filters';
import { useLocationStore } from '../../store/location';

const MUTED_MAP_TYPE = Platform.OS === 'ios' ? 'mutedStandard' : 'standard';

// Above this zoomed-out level we show one pin per quartier (with a count)
// instead of one pin per gym — past ~40 real Lyon gyms, individual price
// pins on a city-wide view turn into unreadable soup.
const CLUSTER_DELTA_THRESHOLD = 0.045;

interface QuartierCluster {
  quartier: string;
  count: number;
  lat: number;
  lng: number;
  latSpan: number;
  lngSpan: number;
}

function clusterByQuartier(gyms: Gym[]): QuartierCluster[] {
  const byQuartier = new Map<string, Gym[]>();
  gyms.forEach((g) => {
    const list = byQuartier.get(g.quartier) ?? [];
    list.push(g);
    byQuartier.set(g.quartier, list);
  });
  return [...byQuartier.entries()].map(([quartier, list]) => {
    const lats = list.map((g) => g.lat);
    const lngs = list.map((g) => g.lng);
    return {
      quartier,
      count: list.length,
      lat: lats.reduce((a, b) => a + b, 0) / list.length,
      lng: lngs.reduce((a, b) => a + b, 0) / list.length,
      latSpan: Math.max(...lats) - Math.min(...lats),
      lngSpan: Math.max(...lngs) - Math.min(...lngs),
    };
  });
}

function MeMarker() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 3.4, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.meRing, { transform: [{ scale }], opacity }]} />
      <View style={styles.meDot} />
    </View>
  );
}

export default function GymMap({ gyms }: { gyms: Gym[] }) {
  const [selected, setSelected] = useState<Gym | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const coords = useLocationStore((s) => s.coords);
  const mapRef = useRef<MapView>(null);
  const me = coords ?? ME_LOCATION;

  const clusters = useMemo(() => clusterByQuartier(gyms), [gyms]);
  const zoomedOut = !region || region.latitudeDelta > CLUSTER_DELTA_THRESHOLD;

  useEffect(() => {
    if (coords) {
      mapRef.current?.animateToRegion({ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }, 600);
    }
  }, [coords?.lat, coords?.lng]);

  const openCluster = (c: QuartierCluster) => {
    setSelected(null);
    mapRef.current?.animateToRegion(
      {
        latitude: c.lat,
        longitude: c.lng,
        latitudeDelta: Math.max(c.latSpan * 2.4, CLUSTER_DELTA_THRESHOLD * 0.55),
        longitudeDelta: Math.max(c.lngSpan * 2.4, CLUSTER_DELTA_THRESHOLD * 0.55),
      },
      500
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        mapType={MUTED_MAP_TYPE as any}
        initialRegion={{ latitude: me.lat, longitude: me.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
        onRegionChangeComplete={setRegion}
        showsUserLocation={!!coords}
      >
        {!coords ? (
          <Marker coordinate={{ latitude: me.lat, longitude: me.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <MeMarker />
          </Marker>
        ) : null}
        {zoomedOut
          ? clusters.map((c) => (
              <Marker key={c.quartier} coordinate={{ latitude: c.lat, longitude: c.lng }} anchor={{ x: 0.5, y: 0.5 }} onPress={() => openCluster(c)} tracksViewChanges={false}>
                <View style={styles.clusterWrap}>
                  <View style={[styles.clusterBubble, shadow.card]}>
                    <View style={styles.clusterCountBadge}>
                      <Text weight="black" color="#fff" style={{ fontSize: 10.5 }}>
                        {c.count}
                      </Text>
                    </View>
                    <Text weight="black" color="#fff" style={{ fontSize: 12.5 }} numberOfLines={1}>
                      {c.quartier}
                    </Text>
                  </View>
                </View>
              </Marker>
            ))
          : gyms.map((g) => (
              <Marker
                key={g.id}
                coordinate={{ latitude: g.lat, longitude: g.lng }}
                anchor={{ x: 0.5, y: g.priceFrom != null ? 1 : 0.5 }}
                onPress={() => setSelected(g)}
                tracksViewChanges={false}
              >
                {g.priceFrom != null ? (
                  <View style={styles.pinWrap}>
                    {g.sponsored ? (
                      <GradientBlock kind="pinkViolet" style={[styles.bubble, shadow.card]}>
                        <Text weight="black" color="#fff" style={{ fontSize: 13 }}>
                          {g.priceFrom}€
                        </Text>
                      </GradientBlock>
                    ) : (
                      <View style={[styles.bubblePlain, shadow.card]}>
                        <Text weight="black" color={colors.ink} style={{ fontSize: 13 }}>
                          {g.priceFrom}€
                        </Text>
                      </View>
                    )}
                    <View style={[styles.tail, g.sponsored && styles.tailAccent]} />
                  </View>
                ) : (
                  <View style={[styles.dotOuter, shadow.card]}>
                    {g.sponsored ? (
                      <GradientBlock kind="pinkViolet" style={styles.dotInnerGradient} />
                    ) : (
                      <View style={styles.dotInner} />
                    )}
                  </View>
                )}
              </Marker>
            ))}
      </MapView>

      {selected ? (
        <Pressable onPress={() => router.push(`/gym/${selected.id}`)} style={[styles.card, shadow.sheet]}>
          <GradientBlock kind={selected.photo as any} style={styles.cardPhoto} />
          <View style={{ flex: 1, minWidth: 0, marginLeft: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text weight="black" style={{ fontSize: 15 }} numberOfLines={1}>
                {selected.name}
              </Text>
              {selected.certified ? <CertifiedBadge size={14} /> : null}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 3 }}>
              <GymRatingMeta gym={selected} distance={distanceLabel(gymDistanceKm(selected, coords))} />
            </Text>
            <Text weight="black" color={colors.pink} style={{ fontSize: 12.5, marginTop: 5 }}>
              {priceLabel(selected.priceFrom)} · Voir la salle →
            </Text>
          </View>
          <Pressable onPress={() => setSelected(null)} hitSlop={8} style={styles.closeBtnWrap}>
            <Glass variant="dark" style={styles.closeBtn}>
              <Text weight="black" color="#fff" style={{ fontSize: 11 }}>
                ✕
              </Text>
            </Glass>
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  meDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.blue, borderWidth: 3, borderColor: '#fff' },
  meRing: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(79,110,247,0.45)' },
  pinWrap: { alignItems: 'center' },
  clusterWrap: { alignItems: 'center' },
  clusterBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 34,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 17,
    backgroundColor: colors.ink,
  },
  clusterCountBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bubblePlain: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.ink },
  dotInnerGradient: { width: 9, height: 9, borderRadius: 4.5 },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  tailAccent: { borderTopColor: colors.violet },
  card: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPhoto: { width: 60, height: 60, borderRadius: radius.md },
  closeBtnWrap: { position: 'absolute', top: 9, right: 9 },
  closeBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
