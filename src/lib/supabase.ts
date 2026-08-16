import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Tant que le projet Supabase du fondateur n'est pas encore branché (voir README),
// l'app tourne en "mode démo" avec les données de src/data/seed.ts. Dès que les deux
// variables d'environnement ci-dessus sont renseignées dans .env, isSupabaseConfigured
// passe à true et l'app peut basculer sur les vraies requêtes réseau.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
