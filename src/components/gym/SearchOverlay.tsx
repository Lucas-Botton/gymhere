import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../ui/Text';
import GradientBlock from '../ui/GradientBlock';
import { EquipBadge, Tag } from '../ui/primitives';
import { IconClose, IconExplore } from '../ui/icons';
import { colors, radius, spacing } from '../../theme';
import { GYMS } from '../../data/seed';
import { searchGyms, POPULAR_EQUIPMENT, POPULAR_ZONES } from '../../lib/filters';

export default function SearchOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchGyms(query, GYMS), [query]);
  const insets = useSafeAreaInsets();

  const go = (id: string, group: string | null) => {
    onClose();
    router.push({ pathname: '/gym/[id]', params: { id, group: group ?? '' } });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <IconExplore size={17} color={colors.textMuted} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Machine, marque, salle, quartier..."
              placeholderTextColor={colors.textLight}
              style={styles.input}
            />
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <IconClose size={18} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          {query.trim().length === 0 ? (
            <>
              <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
                Matériel populaire
              </Text>
              <View style={styles.chipsWrap}>
                {POPULAR_EQUIPMENT.map((e) => (
                  <Pressable key={e} onPress={() => setQuery(e)} style={styles.suggestChip}>
                    <Text weight="extrabold" color={colors.equipText} style={{ fontSize: 12.5 }}>
                      {e}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.xl, marginBottom: spacing.sm }}>
                Quartiers de Lyon
              </Text>
              <View style={styles.chipsWrap}>
                {POPULAR_ZONES.map((z) => (
                  <Pressable key={z} onPress={() => setQuery(z)} style={styles.suggestChipAlt}>
                    <Text weight="extrabold" color={colors.tagText} style={{ fontSize: 12.5 }}>
                      {z}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : results.length === 0 ? (
            <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: spacing.xxl }}>
              Rien pour "{query}". Essaie un autre nom de machine ou de quartier.
            </Text>
          ) : (
            results.map((r) => {
              const gym = GYMS.find((g) => g.id === r.id)!;
              return (
                <Pressable key={r.id} onPress={() => go(r.id, r.activeGroup)} style={styles.resultRow}>
                  <GradientBlock kind={gym.photo as any} style={styles.resultPhoto} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="black" style={{ fontSize: 14.5 }} numberOfLines={1}>
                      {gym.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      {r.isEquip ? <EquipBadge label={r.badgeLabel} /> : <Tag label={r.badgeLabel} />}
                      {r.matchMore ? (
                        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11 }}>
                          {r.matchMore}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.bgTint,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.ink },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgTint, alignItems: 'center', justifyContent: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestChip: { backgroundColor: colors.equipBg, paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill },
  suggestChipAlt: { backgroundColor: colors.tagBg, paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  resultPhoto: { width: 52, height: 52, borderRadius: radius.md },
});
