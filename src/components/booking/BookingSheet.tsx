import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { useBookingSheet } from '../../store/booking';
import { useApp } from '../../store/app';
import { colors, radius, spacing } from '../../theme';
import { BOOKING_CONFIG, bookingDays } from '../../lib/booking-config';
import { useFindCoach } from '../../lib/coaches';
import { ServiceKey } from '../../types';

const GENERIC_SLOTS = ['07:00', '09:30', '12:00', '17:30', '19:00', '20:30'];

export default function BookingSheet() {
  const sheet = useBookingSheet();
  const addBooking = useApp((s) => s.addBooking);
  const showToast = useApp((s) => s.showToast);

  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (sheet.open) {
      setDayIndex(0);
      setSlot(null);
      setMessage('');
      setDone(false);
      setTyping(false);
    }
  }, [sheet.open]);

  const cfg = BOOKING_CONFIG[sheet.kind];
  const days = useMemo(() => bookingDays(), [sheet.open]);
  const activeDay = days[dayIndex];
  const coach = useFindCoach(sheet.targetType === 'coach' ? sheet.coachId : null);

  const slotsForDay = useMemo(() => {
    if (!activeDay) return [];
    if (sheet.targetType === 'coach' && sheet.serviceKey) {
      const ranges = coach?.availability[sheet.serviceKey as ServiceKey]?.[activeDay.wk] ?? [];
      return ranges.map((r) => `${r.from}–${r.to}`);
    }
    return GENERIC_SLOTS;
  }, [activeDay, coach, sheet.serviceKey, sheet.targetType]);

  const canSubmit = cfg.mode === 'request' ? true : !!slot;

  const submit = () => {
    addBooking({
      targetType: sheet.targetType,
      targetId: sheet.targetId,
      targetName: sheet.targetName,
      kind: sheet.kind,
      mode: cfg.mode,
      date: cfg.mode === 'slot' ? activeDay?.iso ?? null : null,
      slot: cfg.mode === 'slot' ? slot : null,
      message,
    });
    setDone(true);
  };

  const close = () => {
    sheet.close();
    if (done) showToast('Enregistré dans "Mes demandes"');
  };

  const goToRequests = () => {
    sheet.close();
    router.push('/requests');
  };

  return (
    <BottomSheet visible={sheet.open} onClose={close} title={done ? undefined : sheet.sub || cfg.label}>
      {done ? (
        <View style={styles.doneWrap}>
          <View style={styles.checkCircle}>
            <Text weight="black" color="#fff" style={{ fontSize: 28 }}>
              ✓
            </Text>
          </View>
          <Text weight="black" style={{ fontSize: 19, textAlign: 'center', marginTop: spacing.lg }}>
            {cfg.done}
          </Text>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: 10 }}>
            {cfg.doneSub}
          </Text>
          <Button label="Voir mes demandes" onPress={goToRequests} style={{ marginTop: spacing.xl, alignSelf: 'stretch', marginHorizontal: spacing.xl }} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: spacing.xl }}
          contentContainerStyle={{ paddingBottom: typing ? spacing.xl + 260 : spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <Text weight="bold" color={colors.textMuted} style={{ fontSize: 13, marginBottom: spacing.md }}>
            {sheet.targetName}
            {sheet.serviceKey ? ` · dispos réelles du coach` : ''}
          </Text>

          {cfg.mode === 'slot' ? (
            <>
              <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
                Choisis une date
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                {days.map((d, i) => (
                  <Pressable
                    key={d.iso}
                    onPress={() => {
                      setDayIndex(i);
                      setSlot(null);
                    }}
                    style={[styles.dayCell, i === dayIndex && styles.dayCellActive]}
                  >
                    <Text weight="bold" color={i === dayIndex ? '#fff' : colors.textMuted} style={{ fontSize: 11 }}>
                      {d.dow}
                    </Text>
                    <Text weight="black" color={i === dayIndex ? '#fff' : colors.ink} style={{ fontSize: 16, marginTop: 2 }}>
                      {d.day}
                    </Text>
                    <Text weight="bold" color={i === dayIndex ? '#fff' : colors.textLight} style={{ fontSize: 10 }}>
                      {d.mon}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
                Choisis un créneau
              </Text>
              {slotsForDay.length === 0 ? (
                <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, marginBottom: spacing.lg }}>
                  Pas de créneau ce jour-là, essaie un autre jour.
                </Text>
              ) : (
                <View style={styles.slotWrap}>
                  {slotsForDay.map((s) => (
                    <Chip key={s} label={s} active={slot === s} onPress={() => setSlot(s)} />
                  ))}
                </View>
              )}
            </>
          ) : (
            cfg.note ? (
              <View style={styles.noteBox}>
                <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13 }}>
                  {cfg.note}
                </Text>
              </View>
            ) : null
          )}

          <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Un mot pour {sheet.targetType === 'coach' ? 'le coach' : 'la salle'} (optionnel)
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Dis-en un peu plus sur toi, tes objectifs..."
            placeholderTextColor={colors.textLight}
            multiline
            style={styles.textarea}
            onFocus={() => {
              setTyping(true);
              requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
            }}
            onBlur={() => setTyping(false)}
          />

          <Button label={cfg.cta} onPress={submit} disabled={!canSubmit} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: 54,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.bgTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dayCellActive: { backgroundColor: colors.pink },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  noteBox: { backgroundColor: colors.bgTint, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
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
  doneWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
