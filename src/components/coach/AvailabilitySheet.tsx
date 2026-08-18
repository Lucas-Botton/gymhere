import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, radius, spacing } from '../../theme';
import { useApp } from '../../store/app';
import { ServiceKey, WeekDay } from '../../types';

const SERVICES: ServiceKey[] = ['Présentiel salle', 'Visio', 'Téléphone'];
const DAYS: WeekDay[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function AvailabilitySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const availability = useApp((s) => s.coachDraft.availability);
  const addSlot = useApp((s) => s.addSlot);
  const removeSlot = useApp((s) => s.removeSlot);
  const [service, setService] = useState<ServiceKey>('Présentiel salle');
  const [day, setDay] = useState<WeekDay>('Lun');
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('20:00');

  const daySlots = availability[service]?.[day] ?? [];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Mes disponibilités">
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.lg }}>
          {SERVICES.map((s) => (
            <Chip key={s} label={s} active={service === s} onPress={() => setService(s)} />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {DAYS.map((d) => {
            const count = availability[service]?.[d]?.length ?? 0;
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
              <Pressable onPress={() => removeSlot(service, day, i)}>
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
          <TextInput value={from} onChangeText={setFrom} placeholder="18:00" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} />
          <Text weight="bold">→</Text>
          <TextInput value={to} onChangeText={setTo} placeholder="20:00" placeholderTextColor={colors.textLight} style={[styles.input, { flex: 1 }]} />
        </View>
        <Button label="Ajouter ce créneau" variant="outline" onPress={() => addSlot(service, day, from, to)} style={{ marginTop: spacing.md }} />
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
