import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { useKeyboardScrollFix } from '../../lib/useKeyboardScrollFix';
import { SlotMode, WeekDay } from '../../types';

const DAYS: WeekDay[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function AvailabilitySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const offers = useApp((s) => s.coachDraft.offers);
  const availability = useApp((s) => s.coachDraft.availability);
  const addSlot = useApp((s) => s.addSlot);
  const removeSlot = useApp((s) => s.removeSlot);
  const [service, setService] = useState<SlotMode | null>(null);
  const [day, setDay] = useState<WeekDay>('Lun');
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('20:00');
  const kb = useKeyboardScrollFix();

  // Only the modes a formule actually uses show up here — no point letting
  // a coach set "Visio" slots if nothing they offer happens by video, and
  // "En ligne" never needs a calendar at all (it's request-based).
  const usedModes = useMemo(() => {
    const set = new Set<SlotMode>();
    offers.forEach((o) => {
      if (o.mode !== 'En ligne') set.add(o.mode as SlotMode);
    });
    return [...set];
  }, [offers]);

  useEffect(() => {
    if (visible && (!service || !usedModes.includes(service))) {
      setService(usedModes[0] ?? null);
    }
  }, [visible, usedModes]);

  const daySlots = service ? availability[service]?.[day] ?? [] : [];

  if (usedModes.length === 0) {
    return (
      <BottomSheet visible={visible} onClose={onClose} title="Mes disponibilités">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>🗓️</Text>
          <Text weight="black" style={{ fontSize: 15, textAlign: 'center' }}>
            Ajoute d’abord une formule
          </Text>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
            Une formule en présentiel ou en visio, pour que tu puisses lui associer des créneaux ici.
          </Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mes disponibilités">
      <ScrollView {...kb.scrollProps} style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: kb.contentPaddingBottom(spacing.xl) }}>
        {usedModes.length > 1 ? (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.lg }}>
            {usedModes.map((s) => (
              <Chip key={s} label={s} active={service === s} onPress={() => setService(s)} />
            ))}
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {DAYS.map((d) => {
            const count = (service ? availability[service]?.[d]?.length : 0) ?? 0;
            const on = day === d;
            return (
              <Pressable key={d} onPress={() => setDay(d)} style={[styles.dayTab, on && { backgroundColor: colors.pink }]}>
                <Text weight="extrabold" color={on ? '#fff' : colors.ink} style={{ fontSize: 12.5 }}>
                  {d}
                </Text>
                {count > 0 ? (
                  <View style={[styles.dayDot, on && { backgroundColor: '#fff' }]} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {daySlots.length === 0 ? (
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, marginBottom: spacing.md }}>
            Aucun créneau ce jour-là pour {service}.
          </Text>
        ) : (
          daySlots.map((r, i) => (
            <View key={i} style={styles.slotRow}>
              <Text weight="extrabold" style={{ fontSize: 13.5 }}>
                {r.from} – {r.to}
              </Text>
              <Pressable onPress={() => service && removeSlot(service, day, i)}>
                <Text weight="black" color={colors.danger}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))
        )}

        <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Ajouter un créneau · {day}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput value={from} onChangeText={setFrom} placeholder="18:00" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} {...kb.inputProps} />
          <Text weight="bold">→</Text>
          <TextInput value={to} onChangeText={setTo} placeholder="20:00" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} {...kb.inputProps} />
        </View>
        <Button label="Ajouter ce créneau" variant="outline" onPress={() => service && addSlot(service, day, from, to)} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  dayTab: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.bgTint, marginRight: 8 },
  dayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.pink, marginTop: 3 },
  slotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: 'Nunito_700Bold', fontSize: 13.5, color: colors.ink, textAlign: 'center' },
});
