import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import BottomSheet from '../src/components/ui/BottomSheet';
import Button from '../src/components/ui/Button';
import { colors, radius, spacing } from '../src/theme';
import { useSession } from '../src/store/session';

export default function Settings() {
  const { logout } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const doLogout = () => {
    setLogoutOpen(false);
    logout();
    router.replace('/role-choice');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Réglages" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Row label="Moyens de paiement" />
        <Row label="Ma position" />
        <Row label="Aide & contact" />
        <Row label="Confidentialité & CGU" />
        <Row label="À propos de gymhere" onPress={() => setAboutOpen(true)} />
        <Pressable onPress={() => setLogoutOpen(true)} style={[styles.row, { borderBottomWidth: 0, marginTop: spacing.lg }]}>
          <Text weight="extrabold" color={colors.danger} style={{ fontSize: 14 }}>
            Déconnexion
          </Text>
        </Pressable>
      </ScrollView>

      <BottomSheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} title="Se déconnecter ?">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13.5, marginBottom: spacing.lg }}>
            Tu pourras te reconnecter à tout moment avec le même compte.
          </Text>
          <Button label="Me déconnecter" variant="dark" onPress={doLogout} />
          <View style={{ height: spacing.sm }} />
          <Button label="Annuler" variant="ghost" onPress={() => setLogoutOpen(false)} />
        </View>
      </BottomSheet>

      <BottomSheet visible={aboutOpen} onClose={() => setAboutOpen(false)} title="À propos de gymhere">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <Text weight="semibold" color={colors.ink} style={{ fontSize: 13.5, lineHeight: 20, marginBottom: spacing.lg }}>
            gymhere réunit toutes les salles de sport et tous les coachs de ta ville, avec une signature
            unique : on te montre le matériel exact de chaque salle, machine par machine, pour ne plus
            jamais t’abonner à l’aveugle.
          </Text>
          <View style={styles.statsRow}>
            <Stat value="128" label="salles à Lyon" />
            <Stat value="340+" label="coachs" />
            <Stat value="100%" label="gratuit pour toi" />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

function Row({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text weight="extrabold" style={{ fontSize: 14, flex: 1 }}>
        {label}
      </Text>
      <Text weight="black" color={colors.textLight} style={{ fontSize: 16 }}>
        ›
      </Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text weight="black" color={colors.pink} style={{ fontSize: 18 }}>
        {value}
      </Text>
      <Text weight="bold" color={colors.textMuted} style={{ fontSize: 10.5, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  statsRow: { flexDirection: 'row', backgroundColor: colors.bgTint, borderRadius: radius.lg, padding: spacing.md },
});
