import { BookingKind } from '../types';

export const BOOKING_CONFIG: Record<BookingKind, { label: string; accent: string; mode: 'slot' | 'request'; cta: string; done: string; doneSub: string; note: string }> = {
  essai: {
    label: 'Séance d’essai gratuite',
    accent: '#FF1F6B',
    mode: 'slot',
    cta: 'Confirmer ma séance',
    done: 'C’est réservé ✓',
    doneSub: 'Ta séance d’essai est confirmée. La salle te contactera pour t’accueillir.',
    note: '',
  },
  inscription: {
    label: 'Demande d’inscription',
    accent: '#FF1F6B',
    mode: 'request',
    cta: 'Envoyer ma demande',
    done: 'Demande envoyée ✓',
    doneSub: 'La salle te recontacte très vite pour finaliser (accès, badge, paiement).',
    note: 'Pas besoin de créneau : renseigne ta demande, la salle s’occupe du reste.',
  },
  contact: {
    label: 'Prendre contact',
    accent: '#C81FFF',
    mode: 'request',
    cta: 'Envoyer mon message',
    done: 'Message envoyé ✓',
    doneSub: 'Le coach te répond en général sous 24h.',
    note: 'Ton message part directement au coach, sans créneau imposé.',
  },
  appel: {
    label: 'Appel découverte',
    accent: '#4D5BFF',
    mode: 'slot',
    cta: 'Réserver l’appel',
    done: 'Appel réservé ✓',
    doneSub: 'Tu recevras un lien de visio avant le rendez-vous.',
    note: '',
  },
  formule: {
    label: 'Choisir une formule',
    accent: '#FF1F6B',
    mode: 'request',
    cta: 'Envoyer ma demande',
    done: 'Demande envoyée ✓',
    doneSub: 'Le coach te confirme le démarrage de ton accompagnement.',
    note: 'Coaching en ligne : pas de créneau fixe, tu démarres dès validation du coach.',
  },
};

export function bookingActionVerb(kind: BookingKind): string {
  if (kind === 'contact') return 'contacter';
  if (kind === 'appel') return 'réserver ton appel avec';
  if (kind === 'essai') return 'réserver ta séance à';
  if (kind === 'inscription') return 't’inscrire à';
  return 'envoyer ta demande à';
}

const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
const DOW_FULL: Array<'Dim' | 'Lun' | 'Mar' | 'Mer' | 'Jeu' | 'Ven' | 'Sam'> = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DOW_SHORT = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

export function bookingDays() {
  const out: { dow: string; day: number; mon: string; wk: (typeof DOW_FULL)[number]; iso: string }[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      dow: i === 0 ? 'Auj.' : DOW_SHORT[d.getDay()],
      day: d.getDate(),
      mon: MONTHS[d.getMonth()],
      wk: DOW_FULL[d.getDay()],
      iso: d.toISOString().slice(0, 10),
    });
  }
  return out;
}
