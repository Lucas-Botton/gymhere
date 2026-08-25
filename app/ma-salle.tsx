import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import Text from '../src/components/ui/Text';
import Button from '../src/components/ui/Button';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import GradientBlock from '../src/components/ui/GradientBlock';
import { Chip } from '../src/components/ui/primitives';
import { IconChevronRight } from '../src/components/ui/icons';
import GymFormulasSheet from '../src/components/gym/GymFormulasSheet';
import GymEquipmentSheet from '../src/components/gym/GymEquipmentSheet';
import { colors, radius, spacing } from '../src/theme';
import { useApp, withGymOverride } from '../src/store/app';
import { useSession } from '../src/store/session';
import { updateGymRemote } from '../src/lib/gymsRepo';
import { pickProfilePhoto } from '../src/lib/imagePicker';
import { GYM_CATEGORY_LABELS, SERVICES, SERVICE_PRESETS } from '../src/data/seed';
import { GymCategory } from '../src/types';

const CATEGORIES = Object.keys(GYM_CATEGORY_LABELS) as GymCategory[];

// Self-service gym back-office (free tier — see the pricing note): a
// claimed gym's owner edits everything a visiting member can see on the
// fiche. Identity fields still excluded: lat/lng (needs a real map
// picker, not a text field, to not risk a fiche drifting off the map)
// and certified/sponsored (gymhere's own trust badge / paid placement —
// not something a gym should be able to award itself).
export default function MaSalle() {
  const ownedGymId = useSession((s) => s.ownedGymId);
  const gyms = useApp((s) => s.gyms);
  const gymOverrides = useApp((s) => s.gymOverrides);
  const updateGymOverride = useApp((s) => s.updateGymOverride);
  const showToast = useApp((s) => s.showToast);

  const baseGym = gyms.find((g) => g.id === ownedGymId);
  const gym = baseGym ? withGymOverride(baseGym, gymOverrides) : null;

  const [name, setName] = useState(gym?.name ?? '');
  const [category, setCategory] = useState<GymCategory>(gym?.category ?? 'salle');
  const [address, setAddress] = useState(gym?.address ?? '');
  const [quartier, setQuartier] = useState(gym?.quartier ?? '');
  const [hours, setHours] = useState(gym?.hours ?? '');
  const [hoursSub, setHoursSub] = useState(gym?.hoursSub ?? '');
  const [phone, setPhone] = useState(gym?.phone ?? '');
  const [website, setWebsite] = useState(gym?.website ?? '');
  const [priceFrom, setPriceFrom] = useState(gym?.priceFrom ? String(gym.priceFrom) : '');
  const [tags, setTags] = useState<string[]>(gym?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [services, setServices] = useState<string[]>((gym?.services ?? []).map((s) => s.name));
  const [gallery, setGallery] = useState<string[]>(gym?.gallery ?? []);
  const [formulasOpen, setFormulasOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!gym) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScreenHeader title="Ma salle" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Text weight="extrabold" style={{ fontSize: 15, textAlign: 'center' }}>
            Tu ne gères encore aucune salle.
          </Text>
          <Button label="Revendiquer ma salle" onPress={() => router.push('/claim-gym')} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  const toggleTag = (t: string) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  const addTagDraft = () => {
    const v = tagDraft.trim();
    if (v && !tags.includes(v)) setTags((s) => [...s, v]);
    setTagDraft('');
  };
  const toggleService = (s: string) => setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const addPhoto = async () => {
    setUploading(true);
    const uri = await pickProfilePhoto(`gyms/${gym.id}`);
    setUploading(false);
    if (uri) setGallery((g) => [...g, uri]);
  };
  const removePhoto = (idx: number) => setGallery((g) => g.filter((_, i) => i !== idx));

  const save = () => {
    const partial = {
      name,
      category,
      address,
      quartier,
      hours,
      hoursSub,
      phone,
      website,
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      tags,
      services: services.map((n) => ({ name: n, ...(SERVICE_PRESETS[n] ?? { icon: '•', tint: colors.bgTint2, color: colors.textMuted }) })),
      gallery,
    };
    updateGymOverride(gym.id, partial);
    updateGymRemote(gym.id, partial);
    showToast('Fiche mise à jour');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScreenHeader title="Ma salle" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 12.5, lineHeight: 18, marginBottom: spacing.lg }}>
            Tout ce que tu renseignes ici est visible immédiatement par les pratiquants qui consultent ta fiche.
          </Text>

          <SectionTitle>Identité</SectionTitle>
          <Field label="Nom de la salle" value={name} onChangeText={setName} placeholder="Nom" />
          <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: spacing.md, marginBottom: 6 }}>
            Catégorie
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {CATEGORIES.map((c) => (
                <Chip key={c} label={GYM_CATEGORY_LABELS[c]} active={category === c} onPress={() => setCategory(c)} />
              ))}
            </View>
          </ScrollView>
          <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="12 rue Exemple, 3e" />
          <Field label="Quartier" value={quartier} onChangeText={setQuartier} placeholder="Part-Dieu" />

          <SectionTitle>Horaires & contact</SectionTitle>
          <Field label="Horaires" value={hours} onChangeText={setHours} placeholder="Lun–Ven 8h–21h" />
          <Field label="Précision horaires" value={hoursSub} onChangeText={setHoursSub} placeholder="Sam 9h–13h · Dim fermé" />
          <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="04 78 00 00 00" keyboardType="phone-pad" />
          <Field label="Site web" value={website} onChangeText={setWebsite} placeholder="https://..." autoCapitalize="none" keyboardType="url" />

          <SectionTitle>Tarif indicatif</SectionTitle>
          <Field label="À partir de (€/mois)" value={priceFrom} onChangeText={setPriceFrom} placeholder="29" keyboardType="number-pad" />

          <SectionTitle>Tags</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm }}>
            {tags.map((t) => (
              <Chip key={t} label={`${t} ✕`} active onPress={() => toggleTag(t)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={tagDraft}
              onChangeText={setTagDraft}
              onSubmitEditing={addTagDraft}
              placeholder="Ajouter un tag (ex: Musculation)"
              placeholderTextColor={colors.textLight}
              style={[styles.input, { flex: 1 }]}
            />
            <Button label="Ajouter" variant="outline" size="sm" onPress={addTagDraft} />
          </View>

          <SectionTitle>Services & équipements de confort</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {SERVICES.map((s) => (
              <Chip key={s} label={s} active={services.includes(s)} onPress={() => toggleService(s)} />
            ))}
          </View>

          <SectionTitle>Photos</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {gallery.map((g, i) => (
                <View key={i} style={styles.photoWrap}>
                  {g.startsWith('http') ? <Image source={{ uri: g }} style={styles.photo} /> : <GradientBlock kind={g} style={styles.photo} />}
                  <Pressable onPress={() => removePhoto(i)} style={styles.photoRemove}>
                    <Text weight="black" color="#fff" style={{ fontSize: 10 }}>
                      ✕
                    </Text>
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={addPhoto} style={styles.addPhoto} disabled={uploading}>
                <Text weight="black" color={colors.pink} style={{ fontSize: 20 }}>
                  {uploading ? '…' : '+'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <Button label="Enregistrer" onPress={save} style={{ marginTop: spacing.xl }} />

          <SectionTitle>Aller plus loin</SectionTitle>
          <SectionRow label="Mes formules" sub={`${gym.formulas.length} formule${gym.formulas.length !== 1 ? 's' : ''}`} onPress={() => setFormulasOpen(true)} />
          <SectionRow
            label="Mon équipement"
            sub={`${gym.groups.reduce((n, g) => n + g.items.length, 0)} machine${gym.groups.reduce((n, g) => n + g.items.length, 0) !== 1 ? 's' : ''}`}
            onPress={() => setEquipmentOpen(true)}
            last
          />
        </ScrollView>
      </View>

      <GymFormulasSheet visible={formulasOpen} onClose={() => setFormulasOpen(false)} gymId={gym.id} />
      <GymEquipmentSheet visible={equipmentOpen} onClose={() => setEquipmentOpen(false)} gymId={gym.id} />
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text weight="black" style={{ fontSize: 14, marginTop: spacing.xl, marginBottom: spacing.sm }}>
      {children}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'url' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text weight="extrabold" style={{ fontSize: 12.5, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

function SectionRow({ label, sub, onPress, last }: { label: string; sub: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text weight="extrabold" style={{ fontSize: 14 }}>
          {label}
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 11.5, marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <IconChevronRight size={16} color={colors.textLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  photoWrap: { width: 72, height: 72 },
  photo: { width: 72, height: 72, borderRadius: 14 },
  photoRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
});
