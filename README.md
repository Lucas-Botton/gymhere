# gymhere · app V1

App mobile (iOS + Android, un seul code) construite avec **React Native (Expo)**, en suivant
le cahier des charges `HANDOFF.md` et la maquette `Jimmy.dc.html`.

> Note technique : le projet tourne sur **Expo SDK 54** (et non la toute dernière 57) car,
> au moment de l'écriture, c'est la seule version qu'Expo Go arrive à installer depuis
> l'App Store (Apple n'a pas encore validé les mises à jour d'Expo Go pour les SDK 55, 56
> et 57). On pourra remonter en SDK plus récent dès qu'Expo Go sera à jour sur l'App Store ;
> ça ne change rien au fonctionnement de l'app.

## Voir l'app sur ton téléphone (aucune installation compliquée)

1. Installe l'application **Expo Go** depuis l'App Store (iPhone) ou le Play Store (Android).
2. Sur un ordinateur, dans ce dossier, lance :
   ```
   npm install
   npx expo start
   ```
3. Un QR code apparaît dans le terminal. Scanne-le avec l'appareil photo de ton téléphone
   (iPhone) ou directement depuis l'app Expo Go (Android). L'app s'ouvre sur ton téléphone.

À chaque fois que le code change, l'app se recharge automatiquement sur ton téléphone.

## Ce qui est construit (V1, périmètre HANDOFF.md section 10)

- Authentification et rôles (pratiquant / coach), mur de connexion contextuel avec reprise
  automatique de l'action.
- Onboarding complet : splash, géolocalisation, sélecteur de ville, choix du rôle, inscription coach.
- Explorer : recherche universelle (nom, quartier, machine, marque), filtres (matériel, services,
  marque, prix, distance, note), bannière + carrousel "objectif" (trie sans jamais filtrer),
  vue liste et vue carte (épingles prix, clustering natif via react-native-maps).
- Fiche salle avec la **signature gymhere** : matériel par groupe musculaire (nom, marque, quantité).
- Visite immersive 360° (placeholder simulé, comme spécifié pour la V1).
- Fiche coach complète : formules en accordéon, diplômes/certifications avec badge de vérification,
  réseaux sociaux, salles d'intervention.
- Réservation (créneau réel ou demande simple selon le cas), confirmation, "Mes demandes".
- Favoris (salles + coachs), Profil, Réglages, Notifications, Messagerie basique.
- Espace coach : fiche éditable par sections, indicateur de complétion, **disponibilités réelles**
  par service et par jour (elles alimentent directement les créneaux réservables côté pratiquant),
  demandes reçues, avis, page d'abonnement (Stripe pas encore branché, prévu en V1.1).

**Volontairement laissé pour V1.1 / V2** (voir `HANDOFF.md` section 10) : paiement Stripe réel,
notifications push, visite 360° avec vraies photos, comparateur de salles, multi-villes.

## Mode démo vs vraies données

Pour que tu puisses tout de suite naviguer dans l'app sans rien configurer, elle tourne par défaut
en **mode démo** : les salles, coachs et machines viennent de `src/data/seed.ts` (mêmes données
que la maquette). Tes actions (favoris, demandes, avis...) sont bien sauvegardées sur ton téléphone
d'une session à l'autre, mais uniquement localement.

### Brancher un vrai compte Supabase (pour de vraies données partagées et persistantes)

Supabase est un service gratuit pour démarrer qui héberge la base de données, les comptes et le stockage des photos.

1. Crée un compte sur [supabase.com](https://supabase.com) et un nouveau projet.
2. Dans l'éditeur SQL du projet, colle et exécute le contenu du fichier `supabase/schema.sql`
   de ce dossier : ça crée toutes les tables (salles, coachs, machines, réservations, avis...).
3. Dans **Project Settings > API**, copie l'"URL" et la clé "anon public".
4. Duplique le fichier `.env.example` en `.env` et colle ces deux valeurs :
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Dans **Authentication > Providers** du projet Supabase, active "Email" (OTP) et, si tu veux
   les boutons Google/Apple, configure ces deux providers avec leurs identifiants (Supabase
   explique pas à pas comment faire sur chaque page de provider).
6. Relance `npx expo start`. La connexion (Google / Apple / e-mail) utilise alors vraiment
   Supabase. Le catalogue salles/coachs reste pour l'instant celui de démo (`src/data/seed.ts`) ;
   le remplacer par de vraies données revient à insérer des lignes dans les tables `gyms`,
   `gym_equipment` et `coaches` plutôt que d'éditer ce fichier.

## Structure du projet

```
app/                 Les écrans (un fichier = un écran, via expo-router)
src/theme/           Couleurs, polices, espacements (identiques à la maquette)
src/components/ui/   Boutons, cartes, bottom sheets, icônes... réutilisés partout
src/components/gym/  Composants propres aux salles (carte, carte interactive, filtres)
src/components/coach/Composants propres à l'espace coach (édition de fiche)
src/data/seed.ts     Données de démonstration (salles, coachs, objectifs)
src/store/           État de l'app (zustand) : session, favoris/filtres/réservations, etc.
src/lib/             Logique pure (recherche, filtres, config des réservations, Supabase, auth)
supabase/schema.sql  Schéma de base de données prêt à l'emploi pour Supabase
```

## Prochaines étapes suggérées

1. Se promener dans l'app avec Expo Go et comparer à `Jimmy.dc.html` pour ajuster les derniers
   détails visuels.
2. Créer le projet Supabase et y coller le contenu du dossier `assets/` avec de vraies photos.
3. V1.1 : messagerie temps réel (déjà préparée dans le modèle de données), notifications push,
   avis vérifiés, abonnement coach payant via Stripe.
