import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import { colors, radius, spacing } from '../src/theme';
import { useApp } from '../src/store/app';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days >= 1) return `il y a ${days}j`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours >= 1) return `il y a ${hours}h`;
  return 'à l’instant';
}

export default function Notifications() {
  const notifications = useApp((s) => s.notifications);
  const markAllRead = useApp((s) => s.markAllNotificationsRead);

  useEffect(() => {
    markAllRead();
  }, []);

  const goBack = () => router.back();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Notifications" onBack={goBack} />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: item.accent + '22' }]}>
              <Text weight="black" color={item.accent} style={{ fontSize: 16 }}>
                {item.icon}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text weight="extrabold" style={{ fontSize: 14 }}>
                {item.title}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 3, lineHeight: 18 }}>
                {item.body}
              </Text>
              <Text weight="bold" color={colors.textLight} style={{ fontSize: 11, marginTop: 4 }}>
                {timeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text weight="semibold" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Rien de nouveau pour l’instant.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconCircle: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
