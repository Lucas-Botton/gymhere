import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../src/components/ui/Text';
import { colors, radius, spacing } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import { Review } from '../../src/types';

export default function Avis() {
  const userId = useSession((s) => s.user?.id);
  const allReviews = useApp((s) => s.reviews);
  const reviews = allReviews.filter((r) => r.targetType === 'coach' && r.targetId === userId);
  const avg = reviews.length > 0 ? (reviews.reduce((n, r) => n + r.stars, 0) / reviews.length).toFixed(1) : '–';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text weight="black" style={{ fontSize: 21 }}>
          Avis
        </Text>
        <View style={styles.avgCard}>
          <Text weight="black" style={{ fontSize: 32 }}>
            {avg}
          </Text>
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12 }}>
            {reviews.length > 0 ? `${'★'.repeat(Math.round(Number(avg)))} · ${reviews.length} avis` : 'Aucun avis pour l’instant'}
          </Text>
        </View>
      </SafeAreaView>
      <FlatList
        data={reviews}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => <ReviewRow review={item} />}
        ListEmptyComponent={
          <Text weight="semibold" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xl }}>
            Tes premiers avis apparaîtront ici après tes séances.
          </Text>
        }
      />
    </View>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <View style={styles.row}>
      <Text weight="extrabold" style={{ fontSize: 13.5 }}>
        {'★'.repeat(review.stars)} · Avis vérifié
      </Text>
      {review.comment ? (
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 3, lineHeight: 18 }}>
          {review.comment}
        </Text>
      ) : null}
      <Text weight="bold" color={colors.textLight} style={{ fontSize: 11, marginTop: 4 }}>
        {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  avgCard: { alignItems: 'center', backgroundColor: colors.bgTint, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  row: { marginBottom: spacing.lg },
});
