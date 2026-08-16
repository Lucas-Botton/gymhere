import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import Text from '../ui/Text';
import { colors, radius, spacing } from '../../theme';
import { EquipmentGroup } from '../../types';
import GradientBlock from '../ui/GradientBlock';

const PREVIEW_COUNT = 4;

export default function EquipmentTabs({ groups, initialGroup }: { groups: EquipmentGroup[]; initialGroup?: string | null }) {
  const [active, setActive] = useState(initialGroup && groups.some((g) => g.group === initialGroup) ? initialGroup : groups[0]?.group);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [active]);

  const group = groups.find((g) => g.group === active) ?? groups[0];
  if (!group) return null;
  const items = expanded ? group.items : group.items.slice(0, PREVIEW_COUNT);
  const hasMore = group.items.length > PREVIEW_COUNT;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {groups.map((g) => {
          const on = g.group === active;
          const content = (
            <View style={[styles.tab, !on && styles.tabInactive]}>
              <Text weight="extrabold" color={on ? '#fff' : '#6B6478'} style={{ fontSize: 12.5 }}>
                {g.group}
              </Text>
            </View>
          );
          return (
            <Pressable key={g.group} onPress={() => setActive(g.group)} style={{ marginRight: 8 }}>
              {on ? (
                <GradientBlock kind="pinkViolet" style={styles.tab}>
                  <Text weight="extrabold" color="#fff" style={{ fontSize: 12.5 }}>
                    {g.group}
                  </Text>
                </GradientBlock>
              ) : (
                content
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {items.map((it, i) => (
          <View key={it.name + i} style={[styles.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.iconDot} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text weight="extrabold" style={{ fontSize: 14 }}>
                {it.name}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12 }}>
                {it.brand !== '–' ? it.brand : 'Marque non précisée'}
              </Text>
            </View>
            <View style={styles.qtyPill}>
              <Text weight="black" color={colors.equipText} style={{ fontSize: 12.5 }}>
                ×{it.qty}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {hasMore ? (
        <Pressable onPress={() => setExpanded((v) => !v)} style={styles.moreBtn}>
          <Text weight="extrabold" color={colors.pink} style={{ fontSize: 13 }}>
            {expanded ? 'Voir moins' : `Voir tout (${group.items.length} machines)`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { height: 38, paddingHorizontal: 16, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  tabInactive: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border },
  list: { backgroundColor: colors.bgTint, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.pink },
  qtyPill: { backgroundColor: colors.equipBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  moreBtn: { alignItems: 'center', paddingVertical: spacing.md },
});
