// Demo dataset, ported from the Jimmy.dc.html mockup so the app is fully
// browsable before a real Supabase project is connected (see README).
import { Coach, Gym, Goal } from '../types';

export const ME_LOCATION = { lat: 45.76, lng: 4.83 };

export const GOALS: Goal[] = [
  { key: 'masse', label: 'Prise de masse', emoji: '💪', gymIds: ['iron', 'crx'], specs: ['Prise de masse', 'Force athlétique', 'Transformation physique'] },
  { key: 'perte', label: 'Perte de poids', emoji: '🔥', gymIds: ['conf', 'ger'], specs: ['Perte de poids', 'Transformation physique'] },
  { key: 'hyrox', label: 'HYROX / Cross-training', emoji: '⚡', gymIds: ['ger', 'crx'], specs: ['HYROX', 'Cross-training', 'Prépa physique'] },
  { key: 'force', label: 'Force athlétique', emoji: '🏋️', gymIds: ['crx', 'iron'], specs: ['Force athlétique', 'Prise de masse'] },
  { key: 'forme', label: 'Remise en forme', emoji: '✨', gymIds: ['conf', 'ger'], specs: ['Perte de poids', 'Sport santé'] },
];

export const MUSCLES = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Abdos/Core', 'Cardio', 'Fonctionnel'];
export const BRANDS = ['Technogym', 'Hammer Strength', 'Eleiko', 'Panatta', 'Concept2', 'Assault'];
export const SERVICES = ['Ouvert 24/7', 'Sauna', 'Hammam', 'Parking', 'Espace femmes', 'Douches', 'Vestiaires', 'Cours collectifs', 'Coachs sur place', 'Accès PMR', 'Bar à protéines', 'Casiers'];
export const SPECS = ['Transformation physique', 'Perte de poids', 'Prise de masse', 'Prépa physique', 'HYROX', 'Cross-training', 'Renforcement musculaire', 'Callisthénie', 'Course à pied', 'Mobilité & souplesse', 'Boxe & sports de combat', 'Pilates', 'Sport santé', 'Post-partum', 'Nutrition & rééquilibrage'];

const g = (name: string, brand: string, qty: number) => ({ name, brand, qty });

export const GYMS: Gym[] = [
  {
    id: 'gymnass', name: 'Gymnass', certified: true, sponsored: true, rating: 4.9, reviews: 180,
    distanceKm: 0.9, priceFrom: 59, photo: 'pinkViolet', tags: ['Coaching', 'Small group', 'Premium'],
    address: '9e · Vaise', quartier: 'Vaise', lat: 45.7735, lng: 4.809,
    hours: '6h30 – 21h30', hoursColor: '#1A1024', hoursSub: 'Lun–Sam',
    services: [
      { name: 'Coaching personnalisé', icon: '◉', tint: '#FDECF3', color: '#F5397F' },
      { name: 'Small group', icon: '◎', tint: '#F4F0FC', color: '#8B5CFF' },
      { name: 'Suivi nutrition', icon: '♥', tint: '#EEF9F6', color: '#12B39A' },
      { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4F6EF7' },
    ],
    formulas: [
      { name: 'Séance découverte', sub: '1er cours offert', price: 'Gratuit', highlight: false },
      { name: 'Small group', sub: 'cours collectif encadré', price: 'à partir de 59€/mois', highlight: true },
      { name: 'Coaching individuel', sub: '1-to-1 sur-mesure', price: 'sur devis', highlight: false },
    ],
    groups: [
      { group: 'Fonctionnel', items: [g('Kettlebells', '–', 12), g('Sled', '–', 1), g('Battle ropes', '–', 2), g('Anneaux', '–', 2)] },
      { group: 'Cardio', items: [g('Assault bike', 'Assault', 2), g('Rameur', 'Concept2', 2), g('SkiErg', 'Concept2', 1)] },
      { group: 'Force', items: [g('Rack à squat', '–', 2), g('Barres olympiques', '–', 4), g('Haltères', '–', 20)] },
      { group: 'Core', items: [g('Wall balls', '–', 6), g('TRX', '–', 4)] },
    ],
    coachIds: ['lea'],
    reviewList: [
      { authorName: 'Diego', authorInitial: 'D', stars: 5, text: 'Coachs au top, ambiance familiale et vrais résultats. Le small group est parfait pour rester motivé.' },
      { authorName: 'Marie', authorInitial: 'M', stars: 5, text: 'Suivi personnalisé exceptionnel, on progresse sans se blesser. Je recommande les yeux fermés.' },
      { authorName: 'Adel', authorInitial: 'A', stars: 5, text: 'Le meilleur studio de Lyon pour se remettre en forme sérieusement. Coachs à l’écoute.' },
    ],
    gallery: ['pinkViolet', 'blueMint', 'coralPink', 'violetBlue'],
  },
  {
    id: 'iron', name: 'Iron Presqu’île', certified: true, sponsored: false, rating: 4.8, reviews: 214,
    distanceKm: 0.4, priceFrom: 39, photo: 'pinkViolet', tags: ['Hack squat', 'Sauna', 'Ouvert 24/7'],
    address: '12 rue de la République, 2e', quartier: 'Presqu’île', lat: 45.764, lng: 4.8335,
    hours: 'Ouvert 24h/24', hoursColor: '#12B39A', hoursSub: 'Accès badge 24/7',
    services: [
      { name: 'Ouvert 24/7', icon: '24', tint: '#FDECF3', color: '#F5397F' },
      { name: 'Sauna', icon: '♨', tint: '#EEF9F6', color: '#12B39A' },
      { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4F6EF7' },
      { name: 'Parking', icon: 'P', tint: '#F4F0FC', color: '#8B5CFF' },
    ],
    formulas: [
      { name: 'Sans engagement', sub: 'résiliable à tout moment', price: '49€', highlight: false },
      { name: 'Abonnement 12 mois', sub: 'le plus populaire', price: '39€', highlight: true },
      { name: 'Séance d’essai', sub: '1 accès découverte', price: 'Gratuit', highlight: false },
    ],
    groups: [
      { group: 'Quadriceps', items: [g('Hack squat', 'Panatta', 2), g('Presse à cuisses', 'Technogym', 2), g('Leg extension', 'Technogym', 3)] },
      { group: 'Pectoraux', items: [g('Développé couché', 'Hammer Strength', 3), g('Pec deck', 'Technogym', 2), g('Développé incliné', 'Hammer Strength', 2)] },
      { group: 'Dos', items: [g('Tirage vertical', 'Technogym', 2), g('Rowing T-bar', 'Hammer Strength', 1), g('Tirage horizontal', 'Technogym', 2)] },
      { group: 'Épaules', items: [g('Développé militaire', 'Hammer Strength', 2), g('Élévation latérale', 'Technogym', 2)] },
      { group: 'Cardio', items: [g('SkiErg', 'Concept2', 2), g('Rameur', 'Concept2', 4), g('Assault bike', 'Assault', 3)] },
    ],
    coachIds: ['lea'],
    reviewList: [
      { authorName: 'Marine', authorInitial: 'M', stars: 5, text: 'Salle top, matériel Hammer Strength nickel et jamais la queue même le soir. Le sauna en bonus, je valide à 100%.' },
      { authorName: 'Yanis', authorInitial: 'Y', stars: 5, text: 'Le hack squat Panatta à lui seul vaut l’abo. Coachs dispos et sympas.' },
    ],
    gallery: ['pinkViolet', 'blueMint', 'coralPink', 'violetBlue'],
  },
  {
    id: 'crx', name: 'Croix-Rousse Strength', certified: true, sponsored: false, rating: 4.7, reviews: 156,
    distanceKm: 1.2, priceFrom: 45, photo: 'violetBlue', tags: ['Eleiko', 'Force athlétique'],
    address: '34 bd de la Croix-Rousse, 4e', quartier: 'Croix-Rousse', lat: 45.7745, lng: 4.832,
    hours: '6h – 23h', hoursColor: '#1A1024', hoursSub: '7j/7',
    services: [
      { name: 'Espace femmes', icon: '♀', tint: '#FDECF3', color: '#F5397F' },
      { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4F6EF7' },
      { name: 'Cours collectifs', icon: '◎', tint: '#F4F0FC', color: '#8B5CFF' },
    ],
    formulas: [
      { name: 'Sans engagement', sub: 'résiliable à tout moment', price: '55€', highlight: false },
      { name: 'Abonnement 12 mois', sub: 'le plus populaire', price: '45€', highlight: true },
      { name: 'Séance d’essai', sub: '1 accès découverte', price: 'Gratuit', highlight: false },
    ],
    groups: [
      { group: 'Dos', items: [g('Rack à tractions', 'Eleiko', 3), g('Rowing Pendlay', 'Eleiko', 2)] },
      { group: 'Quadriceps', items: [g('Squat rack', 'Eleiko', 4), g('Hack squat', 'Panatta', 1)] },
      { group: 'Ischios', items: [g('Leg curl', 'Panatta', 2), g('Soulevé de terre', 'Eleiko', 4)] },
      { group: 'Fonctionnel', items: [g('Kettlebells', 'Eleiko', 20), g('Anneaux', 'Eleiko', 4)] },
    ],
    coachIds: ['sophie'],
    reviewList: [
      { authorName: 'Thomas', authorInitial: 'T', stars: 5, text: 'Le paradis pour la force. Barres Eleiko, plateforme dédiée, ambiance sérieuse mais bienveillante.' },
      { authorName: 'Inès', authorInitial: 'I', stars: 4, text: 'Espace femmes vraiment appréciable. Un peu chargé le midi.' },
    ],
    gallery: ['violetBlue', 'blueMint', 'coralPink', 'pinkViolet'],
  },
  {
    id: 'conf', name: 'Confluence 24/7', certified: false, sponsored: false, rating: 4.4, reviews: 89,
    distanceKm: 2.1, priceFrom: 29, photo: 'blueMint', tags: ['Ouvert 24/7', 'Cardio'],
    address: '6 cours Charlemagne, 2e', quartier: 'Confluence', lat: 45.741, lng: 4.816,
    hours: 'Ouvert 24h/24', hoursColor: '#12B39A', hoursSub: 'Accès badge 24/7',
    services: [
      { name: 'Ouvert 24/7', icon: '24', tint: '#FDECF3', color: '#F5397F' },
      { name: 'Parking', icon: 'P', tint: '#F4F0FC', color: '#8B5CFF' },
      { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4F6EF7' },
    ],
    formulas: [
      { name: 'Sans engagement', sub: 'résiliable à tout moment', price: '35€', highlight: false },
      { name: 'Abonnement 12 mois', sub: 'le plus populaire', price: '29€', highlight: true },
      { name: 'Séance d’essai', sub: '1 accès découverte', price: 'Gratuit', highlight: false },
    ],
    groups: [
      { group: 'Cardio', items: [g('Tapis de course', 'Technogym', 12), g('Elliptique', 'Technogym', 8), g('Vélo', 'Technogym', 10)] },
      { group: 'Pectoraux', items: [g('Développé couché', 'Technogym', 2), g('Pec deck', 'Technogym', 2)] },
      { group: 'Abdos/Core', items: [g('Banc à abdos', 'Technogym', 4), g('Machine crunch', 'Technogym', 2)] },
    ],
    coachIds: [],
    reviewList: [
      { authorName: 'Karim', authorInitial: 'K', stars: 4, text: 'Parfait pour s’entraîner à 6h du mat avant le taf. Cardio au top, un peu juste côté charge libre.' },
    ],
    gallery: ['blueMint', 'pinkViolet', 'coralPink', 'violetBlue'],
  },
  {
    id: 'ger', name: 'Gerland Athletic', certified: false, sponsored: false, rating: 4.6, reviews: 132,
    distanceKm: 3.0, priceFrom: 35, photo: 'coralPink', tags: ['Fonctionnel', 'HYROX'],
    address: '50 av. Jean Jaurès, 7e', quartier: 'Gerland', lat: 45.727, lng: 4.8325,
    hours: '6h30 – 22h30', hoursColor: '#1A1024', hoursSub: '7j/7',
    services: [
      { name: 'Parking', icon: 'P', tint: '#F4F0FC', color: '#8B5CFF' },
      { name: 'Cours collectifs', icon: '◎', tint: '#FDECF3', color: '#F5397F' },
      { name: 'Douches', icon: '🚿', tint: '#EEF0FF', color: '#4F6EF7' },
    ],
    formulas: [
      { name: 'Sans engagement', sub: 'résiliable à tout moment', price: '42€', highlight: false },
      { name: 'Abonnement 12 mois', sub: 'le plus populaire', price: '35€', highlight: true },
      { name: 'Séance d’essai', sub: '1 accès découverte', price: 'Gratuit', highlight: false },
    ],
    groups: [
      { group: 'Fonctionnel', items: [g('SkiErg', 'Concept2', 3), g('Sled push', 'Hammer Strength', 2), g('Wall balls', '–', 15)] },
      { group: 'Cardio', items: [g('Assault bike', 'Assault', 4), g('Rameur', 'Concept2', 6)] },
      { group: 'Fessiers', items: [g('Hip thrust', 'Hammer Strength', 2), g('Presse inclinée', 'Hammer Strength', 2)] },
    ],
    coachIds: ['karim'],
    reviewList: [
      { authorName: 'Léa', authorInitial: 'L', stars: 5, text: 'LA salle pour préparer un HYROX à Lyon. SkiErg, sled, tout y est. Communauté géniale.' },
    ],
    gallery: ['coralPink', 'blueMint', 'pinkViolet', 'violetBlue'],
  },
];

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
      { name: 'Séance en présentiel', mode: 'Présentiel', duration: '1h', price: '60€', per: '/séance', desc: 'À Iron Presqu’île, technique et intensité encadrées.', highlight: false },
      { name: 'Appel découverte', mode: 'Visio', duration: '20 min', price: 'Gratuit', per: '', desc: 'On fait le point sur tes objectifs, sans engagement.', highlight: false },
    ],
    gymIds: ['iron'],
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
    gymIds: ['ger'],
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
    gymIds: ['crx'],
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
