// Real Lyon gym dataset, compiled via cross-checked web research (see the
// audit shared with the app owner). Deliberately conservative: no invented
// ratings, prices, equipment inventories, or customer reviews for any real
// business — those fields are simply omitted/empty until verified data is
// available, and the UI is built to handle that gracefully.
import { Coach, Gym, GymCategory } from '../types';
import { haversineKm } from '../lib/filters';

export const ME_LOCATION = { lat: 45.76, lng: 4.83 };

// Display label per gym category — classified from each gym's own known
// brand/format (chain vs. independent, specialty focus) and its existing
// tags below, never guessed.
export const GYM_CATEGORY_LABELS: Record<GymCategory, string> = {
  salle: 'Salle de sport',
  independante: 'Salle de sport indépendante',
  studio: 'Studio de coaching',
  halterophilie: 'Club d’haltérophilie',
  feminin: 'Salle 100% féminine',
  crossfit: 'Box de CrossFit',
  hyrox: 'Salle HYROX',
  ems: 'Salle d’électrostimulation',
};

export const MUSCLES = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Abdos/Core', 'Cardio', 'Fonctionnel'];
export const BRANDS = ['Technogym', 'Hammer Strength', 'Eleiko', 'Panatta', 'Concept2', 'Assault'];
export const SERVICES = ['Ouvert 24/7', 'Sauna', 'Hammam', 'Parking', 'Espace femmes', 'Douches', 'Vestiaires', 'Cours collectifs', 'Coachs sur place', 'Accès PMR', 'Bar à protéines', 'Casiers'];
export const SPECS = ['Transformation physique', 'Perte de poids', 'Prise de masse', 'Prépa physique', 'HYROX', 'Cross-training', 'Renforcement musculaire', 'Callisthénie', 'Course à pied', 'Mobilité & souplesse', 'Boxe & sports de combat', 'Pilates', 'Sport santé', 'Post-partum', 'Nutrition & rééquilibrage'];

// Small palette of confirmed-service definitions reused across entries below.
const SVC = {
  h24: { name: 'Ouvert 24/7', icon: '24', tint: '#FFE9F1', color: '#FF1F6B' },
  sauna: { name: 'Sauna', icon: '♨', tint: '#DEFAF3', color: '#0E9E86' },
  hammam: { name: 'Hammam', icon: '♨', tint: '#DEFAF3', color: '#0E9E86' },
  piscine: { name: 'Piscine', icon: '~', tint: '#EEF0FF', color: '#4D5BFF' },
  jacuzzi: { name: 'Jacuzzi', icon: '~', tint: '#EEF0FF', color: '#4D5BFF' },
  parking: { name: 'Parking', icon: 'P', tint: '#F4F0FC', color: '#C81FFF' },
  douches: { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4D5BFF' },
  clim: { name: 'Climatisée', icon: '❄', tint: '#EEF0FF', color: '#4D5BFF' },
  femmes: { name: 'Espace femmes', icon: '♀', tint: '#FFE9F1', color: '#FF1F6B' },
  cours: { name: 'Cours collectifs', icon: '◎', tint: '#F4F0FC', color: '#C81FFF' },
  mma: { name: 'Espace MMA/Boxing', icon: '🥊', tint: '#FFE9F1', color: '#FF1F6B' },
};

const PHOTOS = ['pinkViolet', 'violetBlue', 'blueMint', 'coralPink'] as const;

// Every entry below (except Gymnass, corrected from the owner's own
// knowledge) is a real gym compiled from cross-checked public sources —
// see the shared audit. googleRating/googleReviews/priceFrom are OMITTED
// (not guessed) wherever no verified figure was found; the UI treats
// their absence as "no data yet", never as zero. Equipment/formulas are
// intentionally empty for every real gym — none of that exists publicly
// and it's for each gym to provide once contacted, not to invent. Written
// reviews (gymhere's own, distinct from the Google rating above) come
// live from the app's native review flow, never from this seed file.
const RAW_GYMS: Omit<Gym, 'distanceKm'>[] = [
  {
    id: 'gymnass', name: 'Gymnass', category: 'studio', certified: true, sponsored: true, googleRating: 4.9, googleReviews: 48,
    photo: 'pinkViolet', tags: ['Coaching', 'Small group', 'Premium'],
    address: '24 rue Laporte, 9e', quartier: 'Vaise', lat: 45.7716, lng: 4.8032,
    hours: 'Lun–Ven 8h–21h', hoursColor: '#140E1F', hoursSub: 'Sam 9h–13h · Dim fermé',
    phone: '04 78 43 47 67', website: 'https://gymnass.fr',
    services: [], formulas: [], groups: [], coachIds: ['lea'],
    gallery: ['pinkViolet', 'blueMint', 'coralPink', 'violetBlue'],
  },
  {
    id: 'basicfit-republique', name: 'Basic-Fit République', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '13-15 Rue de la République, 1er', quartier: 'Terreaux', lat: 45.764, lng: 4.835,
    hours: 'Lun–Ven 6h–22h30', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 9h–19h',
    website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-villette', name: 'Basic-Fit Villette', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '44 Rue de la Villette, 3e', quartier: 'Villette-Gare', lat: 45.760, lng: 4.860,
    hours: 'Lun–Ven 6h–22h30', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 9h–19h',
    website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-berliet', name: 'Basic-Fit Marius Berliet', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Ouvert 24/7', 'Sans engagement'],
    address: '76 Rue Marius Berliet, 8e', quartier: 'Mermoz', lat: 45.728, lng: 4.873,
    hours: 'Ouvert 24h/24', hoursColor: '#0E9E86', hoursSub: 'Accès badge',
    website: 'https://www.basic-fit.com',
    services: [SVC.h24], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-marietton', name: 'Basic-Fit Marietton', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Musculation', 'Sans engagement'],
    address: '93 Rue Marietton, 9e', quartier: 'Vaise', lat: 45.769, lng: 4.800,
    hours: 'Jusqu’à 22h30', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-audry', name: 'Basic-Fit Pierre Audry', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Ouvert 24/7', 'Sans engagement'],
    address: '54B Rue Pierre Audry, 9e', quartier: 'La Grivière', lat: 45.786, lng: 4.810,
    hours: 'Ouvert 24h/24', hoursColor: '#0E9E86', hoursSub: 'Accès badge',
    website: 'https://www.basic-fit.com',
    services: [SVC.h24], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-gerland', name: 'Basic-Fit Gerland', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: 'Av. Jean Jaurès, 7e', quartier: 'Gerland', lat: 45.730, lng: 4.829,
    hours: 'Lun–Sam 6h–22h30', hoursColor: '#140E1F', hoursSub: 'Dim 9h–19h',
    phone: '03 66 33 33 44', website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-villeurbanne', name: 'Basic-Fit Villeurbanne', category: 'salle', certified: false, sponsored: false,
    googleRating: 3.5, googleReviews: 471,
    photo: PHOTOS[2], tags: ['Musculation', 'Sans engagement'],
    address: '117 Bd de Stalingrad, Villeurbanne', quartier: 'Villeurbanne', lat: 45.774, lng: 4.880,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-venissieux', name: 'Basic-Fit Vénissieux', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Ouvert 24/7', 'Sans engagement'],
    address: '369 Route de Vienne, Vénissieux', quartier: 'Vénissieux', lat: 45.696, lng: 4.876,
    hours: 'Ouvert 24h/24', hoursColor: '#0E9E86', hoursSub: 'Accès badge',
    website: 'https://www.basic-fit.com',
    services: [SVC.h24], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'basicfit-vaulxenvelin', name: 'Basic-Fit Vaulx-en-Velin', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.5, googleReviews: 970,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '236 Av. Franklin Roosevelt, Vaulx-en-Velin', quartier: 'Vaulx-en-Velin', lat: 45.782, lng: 4.912,
    hours: 'Lun–Ven 6h–22h30', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 9h–19h',
    website: 'https://www.basic-fit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'fitnesspark-partdieu', name: 'Fitness Park Part-Dieu', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.3, googleReviews: 909,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '129 Rue Servient (Tour Part-Dieu), 3e', quartier: 'Part-Dieu', lat: 45.760, lng: 4.858,
    hours: 'Lun–Sam 6h–22h', hoursColor: '#140E1F', hoursSub: 'Dim 10h–22h',
    website: 'https://www.fitnesspark.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'fitnesspark-confluence', name: 'Fitness Park Confluence', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Musculation', 'Sans engagement'],
    address: '112 Cours Charlemagne, 2e', quartier: 'Confluence', lat: 45.738, lng: 4.8185,
    hours: '7h30–22h', hoursColor: '#140E1F', hoursSub: '',
    phone: '04 82 91 15 26', website: 'https://www.fitnesspark.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'fitnesspark-terreaux', name: 'Fitness Park Terreaux', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Musculation', 'Sans engagement'],
    address: '3 Rue Sainte-Marie-des-Terreaux, 1er', quartier: 'Terreaux', lat: 45.768, lng: 4.834,
    hours: '6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.fitnesspark.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-partdieu', name: 'Keepcool Part-Dieu', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.2, googleReviews: 279,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '17 Rue du Docteur Bouchut, 3e', quartier: 'Part-Dieu', lat: 45.761, lng: 4.856,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-montchat', name: 'Keepcool Montchat', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '184 Route de Genas, 3e', quartier: 'Montchat', lat: 45.756, lng: 4.879,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-felixfaure', name: 'Keepcool Félix Faure', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Musculation', 'Sans engagement'],
    address: '172 Avenue Félix Faure, 3e', quartier: 'Grange Blanche', lat: 45.749, lng: 4.865,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-vaise', name: 'Keepcool Vaise', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Musculation', 'Sans engagement'],
    address: '14 Rue Masaryk, 9e', quartier: 'Vaise', lat: 45.774, lng: 4.810,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-lyon8', name: 'Keepcool Lyon 8', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.4, googleReviews: 336,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '106 Rue du Professeur Beauvisage, 8e', quartier: 'Monplaisir', lat: 45.738, lng: 4.869,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-confluence', name: 'Keepcool Confluence', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.5, googleReviews: 268,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '35 Rue Dénuzière, 2e', quartier: 'Confluence', lat: 45.742, lng: 4.821,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-sky56', name: 'Keepcool Sky56', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Musculation', 'Sans engagement'],
    address: '20 rue du Général Mouton-Duvernet (Tour Sky56), 3e', quartier: 'Part-Dieu', lat: 45.75919, lng: 4.85678,
    hours: 'Lun–Ven 6h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 7h–20h · Dim 7h–14h, 15h–20h',
    phone: '04 28 29 90 70', website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'keepcool-charpennes', name: 'Keepcool Villeurbanne-Charpennes', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.3, googleReviews: 194,
    photo: PHOTOS[3], tags: ['Musculation', 'Sans engagement'],
    address: '22 rue Gabriel Péri, Villeurbanne', quartier: 'Villeurbanne', lat: 45.7695, lng: 4.881,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    phone: '04 37 43 64 03', website: 'https://www.keepcool.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'neoness-lyon8', name: 'Neoness Lyon 8', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '141 Rue Marius Berliet, 8e', quartier: 'Mermoz', lat: 45.728, lng: 4.873,
    hours: 'Lun/Ven 9h–22h · Mar–Jeu 7h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 9h–19h · Dim 9h–18h',
    website: 'https://www.neoness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'neoness-lyon6', name: 'Neoness Lyon 6', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '92 bis Rue d’Inkermann, 6e', quartier: 'Brotteaux', lat: 45.768, lng: 4.857,
    hours: 'Lun/Ven 9h–22h · Mar–Jeu 7h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 9h–19h · Dim 9h–17h',
    website: 'https://www.neoness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'onair-gambetta', name: 'On Air Gambetta', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.0, googleReviews: 553,
    photo: PHOTOS[2], tags: ['MMA/Boxing', 'Espace femmes'],
    address: '3 Place Aristide Briand, 3e', quartier: 'Saxe-Gambetta', lat: 45.750, lng: 4.846,
    hours: 'Lun–Ven 6h–23h', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 8h–20h',
    website: 'https://www.onair-fitness.fr',
    services: [SVC.mma, SVC.femmes, SVC.clim], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'onair-parmentier', name: 'On Air Parmentier', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.4, googleReviews: 282,
    photo: PHOTOS[3], tags: ['Musculation', 'Cours collectifs'],
    address: '81 Rue Parmentier, 7e', quartier: 'Jean Macé', lat: 45.746, lng: 4.839,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.onair-fitness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'onair-gerland', name: 'On Air Gerland', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Musculation', 'Cours collectifs'],
    address: '60 Avenue Tony Garnier, 7e', quartier: 'Gerland', lat: 45.733, lng: 4.828,
    hours: 'Lun–Ven 6h–23h', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 8h–20h',
    phone: '04 78 24 49 79', website: 'https://www.onair-fitness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'onair-cordeliers', name: 'On Air Cordeliers', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.9, googleReviews: 54,
    photo: PHOTOS[1], tags: ['Musculation', 'Cours collectifs'],
    address: '10 rue Président Carnot, 2e', quartier: 'Cordeliers', lat: 45.760, lng: 4.834,
    hours: 'Lun–Ven 6h–23h', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 8h–20h',
    phone: '04 72 31 24 55', website: 'https://www.onair-fitness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'onair-brotteaux', name: 'On Air Brotteaux', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.3,
    photo: PHOTOS[2], tags: ['Musculation', 'Cours collectifs'],
    address: '34 rue du Professeur Weill, 6e', quartier: 'Brotteaux', lat: 45.769, lng: 4.853,
    hours: 'Lun–Ven 6h–23h', hoursColor: '#140E1F', hoursSub: 'Sam–Dim 8h–20h',
    phone: '09 55 39 49 71', website: 'https://www.onair-fitness.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'vitaliberte-lacassagne', name: 'Vita Liberté Lacassagne', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Musculation', 'Cardio'],
    address: '169-171 Avenue Lacassagne, 3e', quartier: 'Grange Blanche', lat: 45.748, lng: 4.865,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    phone: '04 72 33 78 50', website: 'https://www.vitaliberte.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'lappart-republique', name: 'L’Appart Fitness République', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Musculation', 'Sans engagement'],
    address: '1 Rue de la République, 1er', quartier: 'Cordeliers', lat: 45.763, lng: 4.834,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.lappartfitness.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'lappart-prefecture', name: 'L’Appart Fitness Préfecture', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.4, googleReviews: 495,
    photo: PHOTOS[1], tags: ['Musculation', 'Sans engagement'],
    address: '4 Rue Pravaz, 3e', quartier: 'Part-Dieu', lat: 45.760, lng: 4.850,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.lappartfitness.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'wellness-confluence', name: 'Wellness Sport Club Confluence', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Piscine', 'Spa'],
    address: '134 Cours Charlemagne, 2e', quartier: 'Confluence', lat: 45.735, lng: 4.818,
    hours: 'Lun–Ven 7h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 8h–20h · Dim 8h–17h',
    phone: '04 78 71 79 19', website: 'https://www.wellness-sportclub.fr',
    services: [SVC.piscine, SVC.hammam, SVC.sauna], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'wellness-vendome', name: 'Wellness Sport Club Vendôme', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Piscine', 'Spa'],
    address: '153 rue Vendôme, 3e', quartier: 'Vendôme', lat: 45.762, lng: 4.851,
    hours: 'Lun–Ven 7h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 8h–20h · Dim 8h–17h',
    phone: '04 78 71 02 21', website: 'https://www.wellness-sportclub.fr',
    services: [SVC.piscine, SVC.hammam, SVC.jacuzzi, SVC.sauna], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'wellness-gambetta', name: 'Wellness Sport Club Gambetta', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Piscine', 'Spa'],
    address: '100 Cours Gambetta, 7e', quartier: 'Guillotière', lat: 45.749, lng: 4.846,
    hours: 'Lun–Ven 7h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 8h–20h · Dim 8h–17h',
    website: 'https://www.wellness-sportclub.fr',
    services: [SVC.piscine, SVC.hammam], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'wellness-villeurbanne', name: 'Wellness Sport Club Villeurbanne', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Piscine', 'Spa'],
    address: '56 rue Paul Verlaine, Villeurbanne', quartier: 'Villeurbanne', lat: 45.769, lng: 4.895,
    hours: 'Lun–Ven 8h–22h', hoursColor: '#140E1F', hoursSub: 'Sam 9h–20h · Dim 9h–17h',
    phone: '04 37 43 32 32', website: 'https://www.wellness-sportclub.fr',
    services: [SVC.piscine, SVC.hammam], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'rituel-jeanjaures', name: 'Rituel Sport Club Jean-Jaurès', category: 'salle', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Musculation', 'Cardio'],
    address: '74 Av. Jean Jaurès, 7e', quartier: 'Jean Macé', lat: 45.745, lng: 4.838,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.rituel-sportclub.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'rituel-gambetta', name: 'Rituel Sport Club Gambetta', category: 'salle', certified: false, sponsored: false,
    googleRating: 4.3, googleReviews: 364,
    photo: PHOTOS[3], tags: ['Musculation', 'Cardio'],
    address: '133 Grande Rue de la Guillotière, 7e', quartier: 'Guillotière', lat: 45.749, lng: 4.844,
    hours: '7j/7 6h–23h', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.rituel-sportclub.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'uniq-partdieu', name: 'Uniqe Club', category: 'independante', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Musculation', 'Salle indépendante'],
    address: '9 Rue des Cuirassiers, 3e', quartier: 'Part-Dieu', lat: 45.759, lng: 4.852,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.uniqeclub.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'haltero-club-lyonnais', name: 'Haltéro Club Lyonnais', category: 'halterophilie', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Powerlifting', 'Club historique'],
    address: '53 Rue de Belfort, 4e', quartier: 'Croix-Rousse', lat: 45.775, lng: 4.829,
    hours: '7j/7 7h–23h', hoursColor: '#140E1F', hoursSub: 'Badge d’accès',
    phone: '04 78 28 78 64', website: 'https://www.halteroclublyonnais.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'victor-hugo-monplaisir', name: 'Club Victor Hugo Monplaisir', category: 'independante', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Musculation', 'Salle indépendante'],
    address: '104 Avenue des Frères Lumière, 8e', quartier: 'Monplaisir', lat: 45.738, lng: 4.866,
    hours: 'Accès salle 6h–22h', hoursColor: '#140E1F', hoursSub: '7j/7 · Accueil 11h–13h, 15h–19h',
    phone: '04 78 01 24 88', website: 'https://www.clubvictorhugo.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'sisters-gym', name: 'Sisters’ Gym', category: 'feminin', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['100% féminin', 'Cours collectifs'],
    address: '101 Rue Garibaldi, 6e', quartier: 'Brotteaux', lat: 45.764, lng: 4.854,
    hours: 'Lun–Ven 11h30–20h30', hoursColor: '#140E1F', hoursSub: 'Sam 10h30–13h30 · Dim fermé',
    phone: '04 72 70 65 11',
    services: [SVC.femmes], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'l-form', name: 'L Form', category: 'feminin', certified: false, sponsored: false,
    googleRating: 4.4, googleReviews: 27,
    photo: PHOTOS[0], tags: ['100% féminin', 'Cours collectifs'],
    address: '54 bis Rue Vendôme, 6e', quartier: 'Brotteaux', lat: 45.770, lng: 4.851,
    hours: 'Lun–Jeu 8h30–21h', hoursColor: '#140E1F', hoursSub: 'Ven 8h30–20h30 · Sam 9h–12h · Dim fermé',
    phone: '04 78 93 92 14', website: 'https://www.l-form.fr',
    services: [SVC.femmes, SVC.cours], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'crossfit-gerland', name: 'CrossFit Gerland', category: 'crossfit', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['CrossFit', 'Fonctionnel'],
    address: '18 Rue Croix Barret, 7e', quartier: 'Gerland', lat: 45.737, lng: 4.830,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.crossfit-gerland.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'crossfit-heka', name: 'CrossFit HEKA', category: 'crossfit', certified: false, sponsored: false,
    googleRating: 4.9, googleReviews: 150,
    photo: PHOTOS[2], tags: ['CrossFit', 'Fonctionnel'],
    address: '31 Rue de Cuire, 4e', quartier: 'Croix-Rousse', lat: 45.778, lng: 4.828,
    hours: 'Horaires non communiqués', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://www.crossfit-heka.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'crossfit-secteur3', name: 'CrossFit Secteur 3', category: 'crossfit', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['CrossFit', 'Fonctionnel'],
    address: '169-171 Avenue Lacassagne, 3e', quartier: 'Grange Blanche', lat: 45.748, lng: 4.865,
    hours: 'Lun–Ven 7h–21h', hoursColor: '#140E1F', hoursSub: 'Sam 9h30–16h',
    phone: '06 50 91 92 28', website: 'https://www.crossfit-secteur3.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  // Électrostimulation (EMS) studios — sessions are supervised and
  // by-appointment by design (20-25 min, one-on-one), so "Sur
  // rendez-vous" is the honest hours label rather than a guessed
  // schedule for the studios where specific hours weren't confirmed.
  // Re-checked: BodyHit Lyon 4 Croix-Rousse, Lyon 2 Confluence and Lyon 6
  // Brotteaux have each closed (bodyhit.fr itself shows a "Fermeture
  // club" page for all three) — only Bellecour is still listed as an
  // active club, so that's the only BodyHit kept here.
  {
    id: 'bodyhit-bellecour', name: 'BodyHit Lyon Bellecour', category: 'ems', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Électrostimulation', 'Coaching individuel'],
    address: '39 Rue Thomassin, 2e', quartier: 'Bellecour', lat: 45.759, lng: 4.833,
    hours: 'Sur rendez-vous', hoursColor: '#140E1F', hoursSub: '',
    phone: '04 72 77 62 33', website: 'https://bodyhit.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'ironbodyfit-partdieu', name: 'Iron Bodyfit Lyon Part-Dieu', category: 'ems', certified: false, sponsored: false,
    photo: PHOTOS[0], tags: ['Électrostimulation', 'Coaching individuel'],
    address: '140 Cours Lafayette, 3e', quartier: 'Part-Dieu', lat: 45.761, lng: 4.851,
    hours: 'Lun–Ven 10h30–14h, 16h30–20h', hoursColor: '#140E1F', hoursSub: 'Sam 9h–13h · Dim fermé',
    phone: '07 69 83 76 95', website: 'https://ironbodyfit-lyon.fr',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'ironbodyfit-gerland', name: 'Iron Bodyfit Lyon Gerland', category: 'ems', certified: false, sponsored: false,
    photo: PHOTOS[1], tags: ['Électrostimulation', 'Coaching individuel'],
    address: '61 Allée d’Italie, 7e', quartier: 'Gerland', lat: 45.729, lng: 4.828,
    hours: 'Sur rendez-vous', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://ironbodyfit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    // Owner-confirmed: shares Gymnass's address (co-located).
    id: 'ironbodyfit-vaise', name: 'Iron Bodyfit Lyon Vaise', category: 'ems', certified: false, sponsored: false,
    photo: PHOTOS[2], tags: ['Électrostimulation', 'Coaching individuel'],
    address: '24 Rue Laporte, 9e', quartier: 'Vaise', lat: 45.7716, lng: 4.8032,
    hours: 'Sur rendez-vous', hoursColor: '#140E1F', hoursSub: '',
    website: 'https://ironbodyfit.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
  {
    id: 'vo2max', name: 'Vo2 Max', category: 'independante', certified: false, sponsored: false,
    photo: PHOTOS[3], tags: ['Musculation', 'Cross-training'],
    address: '9 Avenue Leclerc, 7e', quartier: 'Jean Macé', lat: 45.744, lng: 4.843,
    hours: 'Ouvert 7j/7', hoursColor: '#0E9E86', hoursSub: '',
    phone: '04 37 28 90 14', website: 'https://vo2max-lyon.com',
    services: [], formulas: [], groups: [], coachIds: [], gallery: PHOTOS.slice(),
  },
];

export const GYMS: Gym[] = RAW_GYMS.map((r) => ({ ...r, distanceKm: haversineKm(ME_LOCATION, { lat: r.lat, lng: r.lng }) }));

export const COACHES: Coach[] = [
  {
    id: 'lea', name: 'Léa Dubois', rating: 4.9, reviews: 47, zone: 'Presqu’île', photo: 'pinkViolet',
    specs: ['Transformation physique', 'HYROX'],
    bio: 'Coach depuis 8 ans, spécialisée dans la transformation physique et la préparation HYROX. Approche progressive et bienveillante, programmes 100% personnalisés.',
    modalities: ['Coaching en ligne', 'Présentiel Lyon', 'Programmes personnalisés', 'Plans alimentaires', 'Suivi WhatsApp'],
    diplomas: [{ label: 'BPJEPS AGFF', verified: true }, { label: 'DEUST Métiers de la forme', verified: true }],
    certifs: [{ label: 'Bayesian Bodybuilding', verified: true }, { label: 'HYROX Coach L2', verified: true }, { label: 'Nutrition sportive (SFN)', verified: false }],
    offers: [
      { name: 'Suivi en ligne complet', mode: 'En ligne', duration: '12 semaines', price: '240€', per: '/mois', desc: 'Programme + plan alimentaire personnalisés, ajustés chaque semaine. Suivi WhatsApp illimité.', highlight: true },
      { name: 'Séance en présentiel', mode: 'Présentiel', duration: '1h', price: '60€', per: '/séance', desc: 'À Gymnass, technique et intensité encadrées.', highlight: false },
      { name: 'Appel découverte', mode: 'Visio', duration: '20 min', price: 'Gratuit', per: '', desc: 'On fait le point sur tes objectifs, sans engagement.', highlight: false },
    ],
    gymIds: ['gymnass'],
    socials: { instagram: '@lea.coach', tiktok: '@leadubois' },
    gallery: ['pinkViolet', 'blueMint', 'coralPink'],
    availability: {
      'Présentiel salle': { Lun: [{ from: '07:00', to: '12:00' }, { from: '17:00', to: '20:00' }], Mar: [{ from: '17:00', to: '20:00' }], Jeu: [{ from: '07:00', to: '12:00' }], Ven: [{ from: '12:00', to: '14:00' }, { from: '17:00', to: '20:00' }], Sam: [{ from: '09:00', to: '13:00' }] },
      'Visio': { Lun: [{ from: '19:00', to: '21:00' }], Mer: [{ from: '19:00', to: '21:00' }], Dim: [{ from: '10:00', to: '12:00' }] },
      'Téléphone': {},
    },
    published: true,
    completion: 92,
  },
  {
    id: 'karim', name: 'Karim Benali', rating: 4.8, reviews: 63, zone: 'Gerland / 7e', photo: 'coralPink',
    specs: ['Prépa physique', 'Perte de poids'],
    bio: 'Ancien athlète, Karim t’accompagne sur la préparation physique et la perte de poids durable. Suivi nutrition inclus, séances structurées et motivantes.',
    modalities: ['Coaching en ligne', 'Présentiel 7e', 'Plans alimentaires', 'Rééquilibrage', 'Point visio hebdo'],
    diplomas: [{ label: 'BPJEPS AF', verified: true }, { label: 'Licence STAPS Entraînement', verified: true }],
    certifs: [{ label: 'FMCS (Functional Movement)', verified: true }, { label: 'Precision Nutrition L1', verified: true }, { label: 'Prépa physique certifiée', verified: true }],
    offers: [
      { name: 'Transformation 8 semaines', mode: 'En ligne', duration: '8 semaines', price: '320€', per: '', desc: 'Perte de poids durable : entraînement + nutrition + point visio hebdomadaire.', highlight: true },
      { name: 'Programme personnalisé', mode: 'En ligne', duration: 'mensuel', price: '90€', per: '/mois', desc: 'Plan d’entraînement sur-mesure, mis à jour chaque mois.', highlight: false },
      { name: 'Appel découverte', mode: 'Visio', duration: '20 min', price: 'Gratuit', per: '', desc: 'Bilan objectifs + mode de vie.', highlight: false },
    ],
    gymIds: [],
    socials: {},
    gallery: ['coralPink', 'blueMint', 'violetBlue'],
    availability: {
      'Présentiel salle': { Lun: [{ from: '18:00', to: '21:00' }], Mer: [{ from: '18:00', to: '21:00' }], Ven: [{ from: '17:00', to: '20:00' }], Sam: [{ from: '10:00', to: '13:00' }] },
      'Visio': { Mar: [{ from: '19:00', to: '21:00' }], Jeu: [{ from: '19:00', to: '21:00' }] },
      'Téléphone': {},
    },
    published: true,
    completion: 78,
  },
  {
    id: 'sophie', name: 'Sophie Marchand', rating: 4.7, reviews: 38, zone: 'Croix-Rousse / 4e', photo: 'violetBlue',
    specs: ['Prise de masse', 'Force athlétique'],
    bio: 'Passionnée de force athlétique, Sophie construit avec toi une prise de masse propre et durable. Pédagogue, elle corrige chaque mouvement pour progresser sans se blesser.',
    modalities: ['Coaching en ligne', 'Présentiel Croix-Rousse', 'Programmes personnalisés', 'Plans alimentaires', 'Analyse vidéo'],
    diplomas: [{ label: 'BPJEPS AF', verified: true }, { label: 'DEUST STAPS', verified: true }],
    certifs: [{ label: 'Bayesian Bodybuilding', verified: true }, { label: 'Force athlétique (FFForce)', verified: true }, { label: 'Nutrition prise de masse', verified: true }],
    offers: [
      { name: 'Prise de masse encadrée', mode: 'En ligne', duration: '16 semaines', price: '200€', per: '/mois', desc: 'Programme hypertrophie + nutrition adaptée + analyse vidéo de tes mouvements.', highlight: true },
      { name: 'Séance en présentiel', mode: 'Présentiel', duration: '1h', price: '50€', per: '/séance', desc: 'Correction technique sur les gros mouvements de force.', highlight: false },
      { name: 'Appel découverte', mode: 'Visio', duration: '20 min', price: 'Gratuit', per: '', desc: 'On définit ensemble ton objectif de masse.', highlight: false },
    ],
    gymIds: [],
    socials: {},
    gallery: ['violetBlue', 'pinkViolet', 'blueMint'],
    availability: {
      'Présentiel salle': { Mar: [{ from: '18:00', to: '20:30' }], Jeu: [{ from: '18:00', to: '20:30' }], Sam: [{ from: '09:00', to: '12:00' }] },
      'Visio': { Lun: [{ from: '20:00', to: '21:30' }], Mer: [{ from: '20:00', to: '21:30' }] },
      'Téléphone': {},
    },
    published: true,
    completion: 85,
  },
];

export function findGym(id: string | null | undefined) {
  return GYMS.find((gg) => gg.id === id) ?? null;
}
export function findCoach(id: string | null | undefined) {
  return COACHES.find((c) => c.id === id) ?? null;
}
