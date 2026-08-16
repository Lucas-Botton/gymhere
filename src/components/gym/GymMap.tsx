import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { router } from 'expo-router';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import { CertifiedBadge, StarRating } from '../ui/primitives';
import { colors, radius, shadow, spacing } from '../../theme';
import { Gym } from '../../types';
import { ME_LOCATION } from '../../data/seed';
import { distanceLabel } from '../../lib/filters';

export default function GymMap({ gyms }: { gyms: Gym[] }) {
  const [selected, setSelected] = useState<Gym | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: ME_LOCATION.lat, longitude: ME_LOCATION.lng, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
      >
        <Marker coordinate={{ latitude: ME_LOCATION.lat, longitude: ME_LOCATION.lng }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.meDot} />
        </Marker>
        {gyms.map((g) => (
          <Marker
            key={g.id}
            coordinate={{ latitude: g.lat, longitude: g.lng }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => setSelected(g)}
          >
            <View style={styles.pinWrap}>
              {g.sponsored ? (
                <GradientBlock kind="pinkViolet" style={[styles.bubble, selected?.id === g.id && styles.bubbleSelected]}>
                  <Text weight="black" color="#fff" style={{ fontSize: 13 }}>
                    {g.priceFrom}€
                  </Text>
                </GradientBlock>
              ) : (
                <View style={[styles.bubblePlain, selected?.id === g.id && styles.bubbleSelectedPlain]}>
                  <Text weight="black" color={selected?.id === g.id ? '#fff' : colors.ink} style={{ fontSize: 13 }}>
                    {g.priceFrom}€
                  </Text>
                </View>
              )}
              <View style={styles.tail} />
            </View>
          </Marker>
        ))}
      </MapView>

      {selected ? (
        <Pressable onPress={() => router.push(`/gym/${selected.id}`)} style={[styles.card, shadow.card]}>
          <GradientBlock kind={selected.photo as any} style={styles.cardPhoto} />
          <View style={{ flex: 1, minWidth: 0, marginLeft: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text weight="black" style={{ fontSize: 15 }} numberOfLines={1}>
                {selected.name}
              </Text>
              {selected.certified ? <CertifiedBadge size={14} /> : null}
            </View>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 3 }}>
              ★ {selected.rating} · {selected.reviews} avis · {distanceLabel(selected.distanceKm)}
            </Text>
            <Text weight="black" color={colors.pink} style={{ fontSize: 12.5, marginTop: 5 }}>
              dès {selected.priceFrom}€/mois · Voir la salle →
            </Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  meDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.blue, borderWidth: 3, borderColor: '#fff' },
  pinWrap: { alignItems: 'center' },
  bubble: { height: 30, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bubbleSelected: { transform: [{ scale: 1.08 }] },
  bubblePlain: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
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
});
