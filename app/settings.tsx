import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Tap from '../src/components/ui/Tap';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import BottomSheet from '../src/components/ui/BottomSheet';
import Button from '../src/components/ui/Button';
import { IconLocationPin } from '../src/components/ui/icons';
import { colors, radius, spacing } from '../src/theme';
import { useSession } from '../src/store/session';
import { useApp } from '../src/store/app';
import { useLocationStore } from '../src/store/location';

const CITIES = [
  { name: 'Lyon', live: true },
  { name: 'Paris', live: false },
  { name: 'Marseille', live: false },
  { name: 'Bordeaux', live: false },
  { name: 'Lille', live: false },
  { name: 'Toulouse', live: false },
];

const FAQ = [
  { q: 'Comment réserver une séance d’essai ?', a: 'Ouvre la fiche d’une salle, appuie sur "Séance d’essai" et choisis un créneau. Tu recevras une confirmation immédiate.' },
  { q: 'Puis-je annuler une demande ?', a: 'Pour l’instant, contacte directement la salle ou le coach via la messagerie pour annuler ou modifier ta demande.' },
  { q: 'Comment devenir coach sur gymhere ?', a: 'Depuis ton profil, appuie sur "Passer en mode coach" et suis les étapes pour créer ta fiche pro.' },
  { q: 'Les salles affichent-elles vraiment tout leur matériel ?', a: 'Oui, c’est notre signature : chaque salle liste ses machines une par une, avec la marque et la quantité.' },
];

export default function Settings() {
  const { logout, city, setCity, resetOnboarding } = useSession();
  const showToast = useApp((s) => s.showToast);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const requestAndFetchLocation = useLocationStore((s) => s.requestAndFetch);
  const locationLoading = useLocationStore((s) => s.loading);
  const hasLiveCoords = useLocationStore((s) => !!s.coords);

  const doLogout = () => {
    setLogoutOpen(false);
    logout();
    router.replace('/role-choice');
  };

  const reactivateLocation = async () => {
    const ok = await requestAndFetchLocation();
    showToast(ok ? 'Position activée en temps réel ✓' : 'Autorisation refusée, active-la dans Réglages iOS');
  };

  const replayOnboarding = () => {
    resetOnboarding();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScreenHeader title="Réglages" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Row label="Moyens de paiement" onPress={() => setPaymentOpen(true)} />
        <Row label="Ma position" sub={city} onPress={() => setPositionOpen(true)} />
        <Row label="Aide & contact" onPress={() => setHelpOpen(true)} />
        <Row label="Confidentialité & CGU" onPress={() => setLegalOpen(true)} />
        <Row label="À propos de gymhere" onPress={() => setAboutOpen(true)} last />

        <Text weight="extrabold" color={colors.textLight} style={{ fontSize: 11, marginTop: spacing.xl, marginBottom: spacing.sm, textTransform: 'uppercase' }}>
          Aperçu
        </Text>
        <Row label="Revoir l’écran de bienvenue" onPress={replayOnboarding} last />

        <Tap onPress={() => setLogoutOpen(true)} style={[styles.row, { borderBottomWidth: 0, marginTop: spacing.xl }]}>
          <Text weight="extrabold" color={colors.danger} style={{ fontSize: 14 }}>
            Déconnexion
          </Text>
        </Tap>
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

      <BottomSheet visible={positionOpen} onClose={() => setPositionOpen(false)} title="Ma position">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
          <View style={styles.currentCityCard}>
            <IconLocationPin size={20} color={colors.pink} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text weight="extrabold" style={{ fontSize: 14 }}>
                {city}
              </Text>
              <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5 }}>
                {hasLiveCoords ? 'Position temps réel active' : 'Ville active (position non partagée)'}
              </Text>
            </View>
            {hasLiveCoords ? <View style={styles.liveDot} /> : null}
          </View>

          <Button
            label={hasLiveCoords ? 'Actualiser ma position' : 'Activer la géolocalisation'}
            variant="outline"
            loading={locationLoading}
            onPress={reactivateLocation}
            style={{ marginTop: spacing.lg }}
          />

          <Text weight="extrabold" style={{ fontSize: 12.5, marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Changer de ville
          </Text>
          {CITIES.map((c) => (
            <Pressable
              key={c.name}
              onPress={() => {
                if (c.live) {
                  setCity(c.name);
                  showToast(`Ville changée : ${c.name}`);
                  setPositionOpen(false);
                } else {
                  showToast(`${c.name} arrive bientôt !`);
                }
              }}
              style={styles.cityRow}
            >
              <Text weight="extrabold" color={c.live ? colors.ink : colors.textMuted} style={{ fontSize: 14.5, flex: 1 }}>
                {c.name}
              </Text>
              <View style={[styles.cityTag, { backgroundColor: c.live ? colors.successBg : colors.bgTint2 }]}>
                <Text weight="extrabold" color={c.live ? colors.successDeep : colors.textLight} style={{ fontSize: 11 }}>
                  {c.live ? 'Disponible' : 'Bientôt'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={helpOpen} onClose={() => setHelpOpen(false)} title="Aide & contact">
        <ScrollView style={{ paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: spacing.sm }}>
            Questions fréquentes
          </Text>
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <Pressable key={item.q} onPress={() => setOpenFaq(open ? null : i)} style={styles.faqRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text weight="extrabold" style={{ fontSize: 13.5, flex: 1 }}>
                    {item.q}
                  </Text>
                  <Text weight="black" color={colors.textLight}>
                    {open ? '−' : '+'}
                  </Text>
                </View>
                {open ? (
                  <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 8, lineHeight: 18 }}>
                    {item.a}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}

          <Text weight="extrabold" style={{ fontSize: 12.5, marginTop: spacing.xl, marginBottom: spacing.sm }}>
            Besoin d’aide ?
          </Text>
          <Button label="Nous contacter par e-mail" variant="outline" onPress={() => Linking.openURL('mailto:contact@gymhere.app')} />
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={legalOpen} onClose={() => setLegalOpen(false)} title="Confidentialité & CGU">
        <ScrollView style={{ paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 13, lineHeight: 20 }}>
            gymhere respecte ta vie privée : tes données ne sont utilisées que pour te proposer les
            salles et coachs les plus pertinents, et ne sont jamais revendues à des tiers.{'\n\n'}
            Les conditions générales d’utilisation complètes seront publiées ici avant le lancement
            public. Pour toute question en attendant, écris-nous à contact@gymhere.app.
          </Text>
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={paymentOpen} onClose={() => setPaymentOpen(false)} title="Moyens de paiement">
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' }}>
          <Text style={{ fontSize: 34 }}>💳</Text>
          <Text weight="extrabold" style={{ fontSize: 14.5, marginTop: spacing.md, textAlign: 'center' }}>
            Aucun moyen de paiement enregistré
          </Text>
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
            gymhere est 100% gratuit pour toi. Le paiement se fait directement auprès de la salle ou
            du coach au moment de ton inscription.
          </Text>
        </View>
      </BottomSheet>
    </View>
  );
}

function Row({ label, onPress, sub, last }: { label: string; onPress?: () => void; sub?: string; last?: boolean }) {
  return (
    <Tap onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text weight="extrabold" style={{ fontSize: 14, flex: 1 }}>
        {label}
      </Text>
      {sub ? (
        <Text weight="bold" color={colors.textMuted} style={{ fontSize: 12.5, marginRight: 6 }}>
          {sub}
        </Text>
      ) : null}
      <Text weight="black" color={colors.textLight} style={{ fontSize: 16 }}>
        ›
      </Text>
    </Tap>
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
  currentCityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgTint, borderRadius: radius.lg, padding: spacing.md },
  liveDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.successDeep },
  cityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  cityTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  faqRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
});
