import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../../src/components/ui/Text';
import { Avatar } from '../../src/components/ui/primitives';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useApp } from '../../src/store/app';

export default function Demandes() {
  const inbox = useApp((s) => s.inbox);
  const decide = useApp((s) => s.decideInbox);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Demandes reçues
        </Text>
      </SafeAreaView>
      <FlatList
        data={inbox}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => {
          const status = item.decided === 'accepted' ? 'Accepté' : item.decided === 'declined' ? 'Refusé' : 'Nouveau';
          return (
            <View style={[styles.card, shadow.soft]}>
              <View style={{ flexDirection: 'row' }}>
                <Avatar gradient={item.avatarGradient} size={44} initial={item.fromName[0]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text weight="black" style={{ fontSize: 14.5 }}>
                      {item.fromName}
                    </Text>
                    <Text weight="bold" color={colors.textLight} style={{ fontSize: 11 }}>
                      {item.ago}
                    </Text>
                  </View>
                  <Text weight="extrabold" color={colors.pink} style={{ fontSize: 12, marginTop: 2 }}>
                    {item.offer}
                  </Text>
                </View>
              </View>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: spacing.sm, lineHeight: 18 }}>
                {item.message}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                {item.decided ? (
                  <View style={[styles.statusPill, item.decided === 'accepted' ? styles.pillGreen : styles.pillGray]}>
                    <Text weight="extrabold" color={item.decided === 'accepted' ? colors.successDeep : colors.textMuted} style={{ fontSize: 12 }}>
                      {status}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      onPress={() => {
                        decide(item.id, 'accepted');
                        router.push({ pathname: '/coach-chat/[id]', params: { id: item.id, name: item.fromName, avatar: item.avatarGradient } });
                      }}
                      style={styles.acceptBtn}
                    >
                      <Text weight="extrabold" color="#fff" style={{ fontSize: 12.5 }}>
                        Accepter & répondre
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => decide(item.id, 'declined')} style={styles.declineBtn}>
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
