import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Animated, Easing } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { router } from 'expo-router';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import Glass from '../ui/Glass';
import { CertifiedBadge, StarRating } from '../ui/primitives';
import { colors, radius, shadow, spacing } from '../../theme';
import { Gym } from '../../types';
import { ME_LOCATION } from '../../data/seed';
import { distanceLabel, gymDistanceKm } from '../../lib/filters';
import { useLocationStore } from '../../store/location';

const MUTED_MAP_TYPE = Platform.OS === 'ios' ? 'mutedStandard' : 'standard';

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
  const coords = useLocationStore((s) => s.coords);
  const mapRef = useRef<MapView>(null);
  const me = coords ?? ME_LOCATION;

  useEffect(() => {
    if (coords) {
      mapRef.current?.animateToRegion({ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }, 600);
    }
  }, [coords?.lat, coords?.lng]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        mapType={MUTED_MAP_TYPE as any}
        initialRegion={{ latitude: me.lat, longitude: me.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
        showsUserLocation={!!coords}
      >
        {!coords ? (
          <Marker coordinate={{ latitude: me.lat, longitude: me.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <MeMarker />
          </Marker>
        ) : null}
        {gyms.map((g) => (
          <Marker
            key={g.id}
            coordinate={{ latitude: g.lat, longitude: g.lng }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => setSelected(g)}
          >
            <View style={styles.pinWrap}>
              {g.sponsored ? (
                <GradientBlock kind="pinkViolet" style={[styles.bubble, shadow.card, selected?.id === g.id && styles.bubbleSelected]}>
                  <View style={styles.bubbleDot} />
                  <Text weight="black" color="#fff" style={{ fontSize: 13 }}>
                    {g.priceFrom}€
                  </Text>
                </GradientBlock>
              ) : (
                <View style={[styles.bubblePlain, shadow.card, selected?.id === g.id && styles.bubbleSelectedPlain]}>
                  <Text weight="black" color={selected?.id === g.id ? '#fff' : colors.ink} style={{ fontSize: 13 }}>
                    {g.priceFrom}€
                  </Text>
                </View>
              )}
              <View style={[styles.tail, (g.sponsored || selected?.id === g.id) && styles.tailAccent]} />
            </View>
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
              ★ {selected.rating} · {selected.reviews} avis · {distanceLabel(gymDistanceKm(selected, coords))}
            </Text>
            <Text weight="black" color={colors.pink} style={{ fontSize: 12.5, marginTop: 5 }}>
              dès {selected.priceFrom}€/mois · Voir la salle →
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
  bubble: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bubbleDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff', opacity: 0.9 },
  bubbleSelected: { transform: [{ scale: 1.08 }] },
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
  bubbleSelectedPlain: { backgroundColor: colors.pink, borderColor: colors.pink, transform: [{ scale: 1.08 }] },
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
