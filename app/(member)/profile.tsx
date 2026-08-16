import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import Button from '../../src/components/ui/Button';
import GradientBlock from '../../src/components/ui/GradientBlock';
import { Avatar } from '../../src/components/ui/primitives';
import BottomSheet from '../../src/components/ui/BottomSheet';
import { IconBell } from '../../src/components/ui/icons';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useSession } from '../../src/store/session';
import { useApp } from '../../src/store/app';

export default function Profile() {
  const { user, city, becomeCoach } = useSession();
  const bookings = useApp((s) => s.bookings);
  const favGyms = useApp((s) => s.favGyms);
  const favCoaches = useApp((s) => s.favCoaches);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? 'Alex');

  const memberSince = user ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GradientBlock kind="brand" style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <Avatar size={72} gradient="blueMint" initial={(user?.name ?? 'A')[0]} />
            <Text weight="black" color="#fff" style={{ fontSize: 19, marginTop: spacing.sm }}>
              {user?.name ?? 'Alex'}
            </Text>
            <Text weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontSize: 12.5, marginTop: 2 }}>
              {city} · membre depuis {memberSince}
            </Text>
          </View>
        </SafeAreaView>
      </GradientBlock>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Pressable
          onPress={() => {
            becomeCoach();
            router.replace('/(coach)/ma-fiche');
          }}
          style={styles.coachCard}
        >
          <Text style={{ fontSize: 26 }}>🏋️</Text>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text weight="black" color="#fff" style={{ fontSize: 14.5 }}>
              Passer en mode coach
            </Text>
            <Text weight="semibold" color="rgba(255,255,255,0.75)" style={{ fontSize: 11.5, marginTop: 2 }}>
              Publie ta fiche pro et reçois des demandes.
            </Text>
          </View>
          <Text weight="black" color="#fff" style={{ fontSize: 18 }}>
            →
          </Text>
        </Pressable>

        <View style={styles.countersRow}>
          <Pressable onPress={() => router.push('/requests')} style={[styles.counterCard, shadow.soft]}>
            <Text weight="black" style={{ fontSize: 20 }}>
              {bookings.length}
            </Text>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5 }}>
              Demandes
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(member)/favorites')} style={[styles.counterCard, shadow.soft]}>
            <Text weight="black" style={{ fontSize: 20 }}>
              {favGyms.length + favCoaches.length}
            </Text>
            <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5 }}>
              Favoris
            </Text>
          </Pressable>
        </View>

        <Row label="Mes demandes" badge={bookings.length} onPress={() => router.push('/requests')} />
        <Row label="Modifier mon profil" onPress={() => setEditOpen(true)} />
        <Row label="Notifications" badge={unread} onPress={() => router.push({ pathname: '/notifications', params: { from: 'profile' } })} icon={<IconBell size={17} color={colors.textMuted} />} />
        <Row label="Réglages" onPress={() => router.push('/settings')} last />
      </ScrollView>

      <BottomSheet visible={editOpen} onClose={() => setEditOpen(false)} title="Modifier mon profil">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
            Nom
          </Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
          <Button label="Enregistrer" onPress={() => setEditOpen(false)} style={{ marginTop: spacing.lg }} />
        </View>
      </BottomSheet>
    </View>
  );
}

function Row({ label, onPress, badge, icon, last }: { label: string; onPress: () => void; badge?: number; icon?: React.ReactNode; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      {icon}
      <Text weight="extrabold" style={{ fontSize: 14, flex: 1, marginLeft: icon ? spacing.sm : 0 }}>
        {label}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text weight="black" color="#fff" style={{ fontSize: 10.5 }}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text weight="black" color={colors.textLight} style={{ fontSize: 16, marginLeft: 6 }}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.xl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: -spacing.xxl,
    marginBottom: spacing.lg,
  },
  countersRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  counterCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  badge: { backgroundColor: colors.pink, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
});
