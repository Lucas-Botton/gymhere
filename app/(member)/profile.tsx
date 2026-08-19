import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import Tap from '../../src/components/ui/Tap';
import Button from '../../src/components/ui/Button';
import GradientBlock from '../../src/components/ui/GradientBlock';
import { Avatar } from '../../src/components/ui/primitives';
import BottomSheet from '../../src/components/ui/BottomSheet';
import { IconBell } from '../../src/components/ui/icons';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useSession } from '../../src/store/session';
import { useApp } from '../../src/store/app';
import { useKeyboardScrollFix } from '../../src/lib/useKeyboardScrollFix';

export default function Profile() {
  const { user, city, becomeCoach } = useSession();
  const bookings = useApp((s) => s.bookings);
  const favGyms = useApp((s) => s.favGyms);
  const favCoaches = useApp((s) => s.favCoaches);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? 'Alex');
  const kb = useKeyboardScrollFix();

  const memberSince = user ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <GradientBlock kind="brand" style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <View style={styles.avatarWrap}>
                <Avatar size={66} gradient="blueMint" initial={(user?.name ?? 'A')[0]} />
                <View style={styles.editBadge}>
                  <Text style={{ fontSize: 11 }}>✎</Text>
                </View>
              </View>
              <View>
                <Text weight="black" color="#fff" style={{ fontSize: 20 }}>
                  {user?.name ?? 'Alex'}
                </Text>
                <Text weight="bold" color="rgba(255,255,255,0.85)" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {city} · membre depuis {memberSince}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </GradientBlock>

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Tap
            onPress={() => {
              becomeCoach();
              router.replace('/(coach)/ma-fiche');
            }}
          >
            <LinearGradient colors={['#140E1F', '#3A2150', '#5A2E66']} locations={[0, 0.65, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.coachCard, shadow.card]}>
              <View style={styles.coachIconBox}>
                <Text style={{ fontSize: 18 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="black" color="#fff" style={{ fontSize: 14.5 }}>
                  Passer en mode coach
                </Text>
                <Text weight="bold" color="rgba(255,255,255,0.7)" style={{ fontSize: 12, marginTop: 1 }}>
                  Gère ta fiche pro & tes demandes
                </Text>
              </View>
              <Text weight="black" color="rgba(255,255,255,0.6)" style={{ fontSize: 18 }}>
                ›
              </Text>
            </LinearGradient>
          </Tap>

          <View style={styles.countersRow}>
            <Tap onPress={() => router.push('/requests')} style={[styles.counterCard, shadow.soft]}>
              <Text weight="black" color={colors.pink} style={{ fontSize: 22 }}>
                {bookings.length}
              </Text>
              <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
                Demande(s)
              </Text>
            </Tap>
            <Tap onPress={() => router.push('/(member)/favorites')} style={[styles.counterCard, shadow.soft]}>
              <Text weight="black" color={colors.violet} style={{ fontSize: 22 }}>
                {favGyms.length + favCoaches.length}
              </Text>
              <Text weight="extrabold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
                Favori(s)
              </Text>
            </Tap>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <Row
              label="Mes demandes"
              badge={bookings.length}
              tint={colors.equipBg}
              iconColor={colors.pink}
              icon="▤"
              onPress={() => router.push('/requests')}
            />
            <Row label="Modifier mon profil" tint={colors.bgTint2} iconColor={colors.violet} icon="✎" onPress={() => setEditOpen(true)} />
            <Row
              label="Notifications"
              badge={unread}
              tint="#EEF0FF"
              iconColor={colors.blue}
              icon={<IconBell size={15} color={colors.blue} />}
              onPress={() => router.push('/notifications')}
            />
            <Row label="Réglages" tint={colors.bgTint} iconColor={colors.textMuted} icon="⚙" onPress={() => router.push('/settings')} />
          </View>
        </View>
      </ScrollView>

      <BottomSheet visible={editOpen} onClose={() => setEditOpen(false)} title="Modifier mon profil">
        <ScrollView {...kb.scrollProps} contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
          <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
            Nom
          </Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} {...kb.inputProps} />
          <Button label="Enregistrer" onPress={() => setEditOpen(false)} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function Row({
  label,
  onPress,
  badge,
  icon,
  tint,
  iconColor,
}: {
  label: string;
  onPress: () => void;
  badge?: number;
  icon: React.ReactNode;
  tint: string;
  iconColor: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        {typeof icon === 'string' ? (
          <Text weight="black" color={iconColor} style={{ fontSize: 14 }}>
            {icon}
          </Text>
        ) : (
          icon
        )}
      </View>
      <Text weight="extrabold" style={{ fontSize: 14.5, flex: 1 }}>
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
  header: { paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  avatarWrap: { position: 'relative' },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#280A32',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  coachIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countersRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  counterCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
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
