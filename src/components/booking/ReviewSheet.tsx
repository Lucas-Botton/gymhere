import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import Confetti from '../ui/Confetti';
import { Chip } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { Booking, TargetType } from '../../types';

const CRITERIA: Record<TargetType, string[]> = {
  gym: ['Matériel', 'Propreté', 'Affluence', 'Ambiance'],
  coach: ['Pédagogie', 'Résultats', 'Ponctualité', 'Motivation'],
};
const TAGS: Record<TargetType, string[]> = {
  gym: ['Machines au top', 'Jamais la queue', 'Personnel sympa', 'Très propre', 'Bon rapport qualité/prix', 'Vestiaires nickel'],
  coach: ['À l’écoute', 'Programme sur-mesure', 'Motivant', 'Résultats visibles', 'Ponctuel', 'Bons conseils nutrition'],
};
const LABELS = ['', 'Décevant', 'Correct', 'Bien', 'Très bien', 'Excellent'];

export default function ReviewSheet({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const addReview = useApp((s) => s.addReview);
  const reviewsSoFar = useApp((s) => s.reviews.length);
  const [stars, setStars] = useState(0);
  const [criteria, setCriteria] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [firstReview, setFirstReview] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (booking) {
      setStars(0);
      setCriteria({});
      setTags([]);
      setComment('');
      setDone(false);
      setFirstReview(false);
      setTyping(false);
    }
  }, [booking?.id]);

  if (!booking) return <BottomSheet visible={false} onClose={onClose}><View /></BottomSheet>;

  const kind = booking.targetType;
  const crit = CRITERIA[kind];
  const tagOptions = TAGS[kind];

  const toggleTag = (t: string) => setTags((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]));

  const submit = () => {
    const isFirst = reviewsSoFar === 0;
    addReview({ bookingId: booking.id, targetType: kind, targetId: booking.targetId, stars, criteria, tags, comment });
    setFirstReview(isFirst);
    setDone(true);
    if (isFirst) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <BottomSheet visible={!!booking} onClose={onClose} title={done ? undefined : `Avis · ${booking.targetName}`}>
      {done ? (
        <View style={styles.doneWrap}>
          <Confetti active={firstReview} />
          <Text style={{ fontSize: 40 }}>🎉</Text>
          <Text weight="black" style={{ fontSize: 18, textAlign: 'center', marginTop: spacing.md }}>
            Merci pour ton avis !
          </Text>
          <View style={styles.badge}>
            <Text weight="extrabold" color={colors.successDeep} style={{ fontSize: 12.5 }}>
              ✓ Avis vérifié · +10 pts commu
            </Text>
          </View>
          <Button label="Fermer" onPress={onClose} style={{ marginTop: spacing.xl, alignSelf: 'stretch', marginHorizontal: spacing.xl }} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: spacing.xl }}
          contentContainerStyle={{ paddingBottom: typing ? spacing.xl + 260 : spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setStars(n)} hitSlop={4}>
                  <Text style={{ fontSize: 30 }}>{n <= stars ? '★' : '☆'}</Text>
                </Pressable>
              ))}
            </View>
            {stars > 0 ? (
              <Text weight="extrabold" color={colors.pink} style={{ fontSize: 13, marginTop: 6 }}>
                {LABELS[stars]}
              </Text>
            ) : null}
          </View>

          {crit.map((c) => (
            <View key={c} style={{ marginBottom: spacing.md }}>
              <Text weight="extrabold" style={{ fontSize: 13, marginBottom: 6 }}>
                {c}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setCriteria((s) => ({ ...s, [c]: n }))} hitSlop={4}>
                    <Text style={{ fontSize: 20 }}>{n <= (criteria[c] ?? 0) ? '★' : '☆'}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.sm }}>
            Tags rapides
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
            {tagOptions.map((t) => (
              <Chip key={t} label={t} active={tags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
          </View>

          <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
            Ton commentaire
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Raconte ton expérience..."
            placeholderTextColor={colors.textLight}
            multiline
            style={styles.textarea}
            onFocus={() => {
              setTyping(true);
              requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
            }}
            onBlur={() => setTyping(false)}
          />

          <Button label="Publier mon avis" onPress={submit} disabled={stars === 0} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  doneWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  badge: { backgroundColor: colors.successBg, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, marginTop: spacing.md },
  textarea: {
    minHeight: 80,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
