import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import GradientBlock from '../src/components/ui/GradientBlock';
import Glass from '../src/components/ui/Glass';
import { Tag, VerifiedPill } from '../src/components/ui/primitives';
import { IconBack } from '../src/components/ui/icons';
import { colors, radius, spacing } from '../src/theme';
import { useApp } from '../src/store/app';
import { useSession } from '../src/store/session';

export default function CoachPreview() {
  const draft = useApp((s) => s.coachDraft);
  const { user } = useSession();
  const name = user?.name || draft.name || 'Ton nom';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView bounces={false}>
        <GradientBlock kind={draft.photo as any} style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroTop}>
            <Pressable onPress={() => router.replace('/(coach)/ma-fiche')}>
              <Glass variant="dark" style={styles.roundBtn}>
                <IconBack size={18} color="#fff" />
              </Glass>
            </Pressable>
            <Glass variant="dark" style={styles.previewTag}>
              <Text weight="black" color="#fff" style={{ fontSize: 10.5 }}>
                APERÇU CLIENT
              </Text>
            </Glass>
          </SafeAreaView>
        </GradientBlock>

        <View style={styles.body}>
          <Text weight="black" style={{ fontSize: 22 }}>
            {name}
          </Text>
          {draft.specs.length > 0 ? (
            <View style={styles.tagsRow}>
              {draft.specs.map((s) => (
                <Tag key={s} label={s} />
              ))}
            </View>
          ) : null}

          {draft.bio ? (
            <>
              <SectionTitle>À propos</SectionTitle>
              <Text weight="semibold" style={{ fontSize: 13.5, lineHeight: 20 }}>
                {draft.bio}
              </Text>
            </>
          ) : null}

          {draft.offers.length > 0 ? (
            <>
              <SectionTitle>Formules d’accompagnement</SectionTitle>
              {draft.offers.map((o) => (
                <View key={o.name} style={styles.offer}>
                  <Text weight="extrabold" style={{ fontSize: 14 }}>
                    {o.name}
                  </Text>
                  <Text weight="bold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 3 }}>
                    {o.mode} · {o.duration} · {o.price}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {draft.diplomas.length > 0 || draft.certifs.length > 0 ? (
            <>
              <SectionTitle>Diplômes & certifications</SectionTitle>
              {[...draft.diplomas, ...draft.certifs].map((c) => (
                <View key={c.label} style={styles.credRow}>
                  <Text weight="semibold" style={{ fontSize: 13, flex: 1 }}>
                    {c.label}
                  </Text>
                  <VerifiedPill verified={c.verified} />
                </View>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text weight="black" style={{ fontSize: 16.5, marginTop: spacing.xl, marginBottom: spacing.md }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  roundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  previewTag: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  body: { padding: spacing.lg },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  offer: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  credRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
