import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { Chip } from '../ui/primitives';
import { useReportSheet } from '../../store/report';
import { useApp } from '../../store/app';
import { colors, radius, spacing } from '../../theme';
import { ReportReason } from '../../types';

const REASONS: Record<'gym' | 'coach', { key: ReportReason; label: string }[]> = {
  gym: [
    { key: 'horaires', label: 'Horaires incorrects' },
    { key: 'tarifs', label: 'Tarifs incorrects' },
    { key: 'coordonnees', label: 'Adresse ou téléphone incorrects' },
    { key: 'indisponible', label: 'Cette salle a fermé' },
    { key: 'autre', label: 'Autre' },
  ],
  coach: [
    { key: 'horaires', label: 'Disponibilités incorrectes' },
    { key: 'tarifs', label: 'Tarifs incorrects' },
    { key: 'coordonnees', label: 'Coordonnées incorrectes' },
    { key: 'indisponible', label: 'Ce coach n’est plus disponible' },
    { key: 'autre', label: 'Autre' },
  ],
};

export default function ReportSheet() {
  const sheet = useReportSheet();
  const addReport = useApp((s) => s.addReport);
  const showToast = useApp((s) => s.showToast);

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (sheet.open) {
      setReason(null);
      setMessage('');
      setDone(false);
      setTyping(false);
    }
  }, [sheet.open]);

  const reasons = REASONS[sheet.targetType];

  const submit = () => {
    if (!reason) return;
    addReport({ targetType: sheet.targetType, targetId: sheet.targetId, targetName: sheet.targetName, reason, message });
    setDone(true);
  };

  const close = () => {
    sheet.close();
    if (done) showToast('Merci, on regarde ça');
  };

  return (
    <BottomSheet visible={sheet.open} onClose={close} title={done ? undefined : 'Signaler un problème'}>
      {done ? (
        <View style={styles.doneWrap}>
          <View style={styles.checkCircle}>
            <Text weight="black" color="#fff" style={{ fontSize: 28 }}>
              ✓
            </Text>
          </View>
          <Text weight="black" style={{ fontSize: 19, textAlign: 'center', marginTop: spacing.lg }}>
            Signalement envoyé
          </Text>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: 10 }}>
            Merci, on vérifie l’info et on corrige la fiche si besoin.
          </Text>
          <Button label="Fermer" onPress={close} style={{ marginTop: spacing.xl, alignSelf: 'stretch', marginHorizontal: spacing.xl }} />
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
          </Text>

          <Text weight="extrabold" style={{ fontSize: 13, marginBottom: spacing.sm }}>
            Qu’est-ce qui ne va pas ?
          </Text>
          <View style={styles.reasonWrap}>
            {reasons.map((r) => (
              <Chip key={r.key} label={r.label} active={reason === r.key} onPress={() => setReason(r.key)} />
            ))}
          </View>

          <Text weight="extrabold" style={{ fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Précise-nous ça (optionnel)
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ex : la salle ferme à 21h en semaine, pas 22h30..."
            placeholderTextColor={colors.textLight}
            multiline
            style={styles.textarea}
            onFocus={() => {
              setTyping(true);
              requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
            }}
            onBlur={() => setTyping(false)}
          />

          <Button label="Envoyer le signalement" onPress={submit} disabled={!reason} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
