import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import { Avatar } from '../../src/components/ui/primitives';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { Booking } from '../../src/types';

const AVATAR_GRADIENTS = ['pinkViolet', 'blueMint', 'coralPink'];

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

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days >= 1) return `il y a ${days}j`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours >= 1) return `il y a ${hours}h`;
  return 'à l’instant';
}

export default function Demandes() {
  const bookings = useApp((s) => s.incomingBookings);
  const respond = useApp((s) => s.respondToBooking);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Demandes reçues
        </Text>
      </SafeAreaView>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item, index }) => {
          const fromName = item.fromName || 'Un pratiquant';
          const decided = item.status === 'accepte' || item.status === 'confirme' ? 'accepted' : item.status === 'refuse' ? 'declined' : null;
          const status = decided === 'accepted' ? 'Accepté' : decided === 'declined' ? 'Refusé' : 'Nouveau';
          return (
            <View style={[styles.card, shadow.soft]}>
              <View style={{ flexDirection: 'row' }}>
                <Avatar gradient={AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} size={44} initial={fromName[0]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text weight="black" style={{ fontSize: 14.5 }}>
                      {fromName}
                    </Text>
                    <Text weight="bold" color={colors.textLight} style={{ fontSize: 11 }}>
                      {timeAgo(item.createdAt)}
                    </Text>
                  </View>
                  <Text weight="extrabold" color={colors.pink} style={{ fontSize: 12, marginTop: 2 }}>
                    {kindLabel(item.kind)}
                  </Text>
                </View>
              </View>
              {item.message ? (
                <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: spacing.sm, lineHeight: 18 }}>
                  {item.message}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                {decided ? (
                  <View style={[styles.statusPill, decided === 'accepted' ? styles.pillGreen : styles.pillGray]}>
                    <Text weight="extrabold" color={decided === 'accepted' ? colors.successDeep : colors.textMuted} style={{ fontSize: 12 }}>
                      {status}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      onPress={() => {
                        respond(item.id, 'accepte');
                        router.push({ pathname: '/coach-chat/[id]', params: { id: item.userId, name: fromName, avatar: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] } });
                      }}
                      style={styles.acceptBtn}
                    >
                      <Text weight="extrabold" color="#fff" style={{ fontSize: 12.5 }}>
                        Accepter & répondre
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => respond(item.id, 'refuse')} style={styles.declineBtn}>
                      <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 12.5 }}>
                        Refuser
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text weight="semibold" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Aucune demande pour l’instant.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  acceptBtn: { backgroundColor: colors.pink, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  declineBtn: { backgroundColor: colors.bgTint, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  pillGreen: { backgroundColor: colors.successBg },
  pillGray: { backgroundColor: colors.bgTint },
});
