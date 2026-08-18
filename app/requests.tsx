import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import { StatusPill } from '../src/components/ui/primitives';
import ReviewSheet from '../src/components/booking/ReviewSheet';
import { colors, radius, shadow, spacing } from '../src/theme';
import { useApp } from '../src/store/app';
import { Booking } from '../src/types';
import { findCoach } from '../src/data/seed';

export default function Requests() {
  const bookings = useApp((s) => s.bookings);
  const reviews = useApp((s) => s.reviews);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const reviewedIds = new Set(reviews.map((r) => r.bookingId));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Mes demandes" />
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const reviewed = reviewedIds.has(item.id);
          const canReview = (item.status === 'confirme' || item.status === 'accepte') && !reviewed;
          return (
            <View style={[styles.card, shadow.soft]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text weight="black" style={{ fontSize: 15, flex: 1, marginRight: spacing.sm }}>
                  {item.targetName}
                </Text>
                <StatusPill status={item.status} />
              </View>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 4 }}>
                {kindLabel(item.kind)}
                {item.date ? ` · ${item.date}` : ''}
                {item.slot ? ` · ${item.slot}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                {canReview ? (
                  <Pressable onPress={() => setReviewBooking(item)} style={styles.actionBtn}>
                    <Text weight="extrabold" color={colors.pink} style={{ fontSize: 12.5 }}>
                      Laisser un avis
                    </Text>
                  </Pressable>
                ) : null}
                {item.targetType === 'coach' ? (
                  <Pressable
                    onPress={() => {
                      const coach = findCoach(item.targetId);
                      if (coach) router.push({ pathname: '/chat/[id]', params: { id: coach.id } });
                    }}
                    style={styles.actionBtn}
                  >
                    <Text weight="extrabold" color={colors.violet} style={{ fontSize: 12.5 }}>
                      Envoyer un message
                    </Text>
                  </Pressable>
                ) : null}
                {reviewed ? (
                  <Text weight="bold" color={colors.textLight} style={{ fontSize: 12, alignSelf: 'center' }}>
                    Avis publié ✓
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text weight="extrabold" style={{ fontSize: 15, marginTop: spacing.md, textAlign: 'center' }}>
              Aucune demande pour l’instant
            </Text>
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Réserve une séance d’essai ou contacte un coach pour la voir apparaître ici.
            </Text>
            <Button label="Explorer les salles" onPress={() => router.push('/(member)/explore')} style={{ marginTop: spacing.xl }} />
          </View>
        }
      />
      <ReviewSheet booking={reviewBooking} onClose={() => setReviewBooking(null)} />
    </View>
  );
}

function kindLabel(kind: Booking['kind']) {
  switch (kind) {
    case 'essai':
      return 'Séance d’essai';
    case 'inscription':
      return 'Demande d’inscription';
    case 'contact':
      return 'Prise de contact';
    case 'appel':
      return 'Appel découverte';
    case 'formule':
      return 'Formule';
  }
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  actionBtn: { backgroundColor: colors.bgTint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  empty: { alignItems: 'center', marginTop: spacing.xxl * 2, paddingHorizontal: spacing.xl },
});
