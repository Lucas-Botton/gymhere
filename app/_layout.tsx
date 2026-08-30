import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Gabarito_400Regular,
  Gabarito_500Medium,
  Gabarito_600SemiBold,
  Gabarito_700Bold,
  Gabarito_800ExtraBold,
  Gabarito_900Black,
} from '@expo-google-fonts/gabarito';
import AuthSheet from '../src/components/booking/AuthSheet';
import BookingSheet from '../src/components/booking/BookingSheet';
import ReportSheet from '../src/components/report/ReportSheet';
import Toast from '../src/components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import { fetchGyms } from '../src/lib/gymsRepo';
import { fetchPublishedCoaches, fetchMyCoachDraft } from '../src/lib/coachesRepo';
import { fetchMyBookings } from '../src/lib/bookingsRepo';
import { fetchReviews } from '../src/lib/reviewsRepo';
import { ensureUserProfile } from '../src/lib/usersRepo';
import { useSession } from '../src/store/session';
import { useApp } from '../src/store/app';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Gabarito_400Regular,
    Gabarito_500Medium,
    Gabarito_600SemiBold,
    Gabarito_700Bold,
    Gabarito_800ExtraBold,
    Gabarito_900Black,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  // Quand un vrai projet Supabase est branché (voir README), on garde la session
  // locale synchronisée avec la session Supabase (connexion / déconnexion / refresh).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const sync = useSession.getState().syncFromSupabase;
    // Every table this app writes to (coaches, bookings, reviews,
    // messages, gyms.owner_id...) has a foreign key into public.users —
    // Supabase Auth never creates that row on its own, only auth.users,
    // so every remote write would otherwise fail silently. Fired
    // best-effort right alongside the local session sync.
    const syncUser = (user: { id: string; email?: string | null } | null) => {
      sync(user);
      if (user) ensureUserProfile(user.id, user.email?.split('@')[0] ?? 'Toi', user.email ?? '');
    };
    supabase.auth.getSession().then(({ data }) => syncUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Real gyms, once — falls back silently to the local demo dataset
  // (already the store's default) if Supabase isn't configured or the
  // fetch fails, so this can never leave the app with nothing to show.
  useEffect(() => {
    fetchGyms().then((gyms) => {
      if (gyms) useApp.getState().setGyms(gyms);
    });
  }, []);

  // Every real coach published from another device — merged with the demo
  // COACHES by useAllCoaches() (lib/coaches.ts), never replacing them.
  useEffect(() => {
    fetchPublishedCoaches().then((coaches) => {
      if (coaches) useApp.getState().setCoaches(coaches);
    });
  }, []);

  // Every review, from every account — public, so fetched once for
  // everyone regardless of sign-in state, and merged with whatever this
  // device already has locally.
  useEffect(() => {
    fetchReviews().then((reviews) => {
      if (reviews) useApp.getState().hydrateReviews(reviews);
    });
  }, []);

  // Restores a signed-in coach's own fiche from Supabase on a fresh
  // device/reinstall. Guarded to only fill in a still-untouched local
  // draft (empty name) so it can never clobber in-progress local edits
  // with a stale remote copy.
  const userId = useSession((s) => s.user?.id);
  useEffect(() => {
    if (!userId) return;
    const draft = useApp.getState().coachDraft;
    if (draft.name.trim().length > 0) return;
    fetchMyCoachDraft(userId).then((remote) => {
      if (remote) useApp.getState().updateCoachDraft(remote);
    });
  }, [userId]);

  // Restores this account's booking history on a fresh device/reinstall —
  // merges in anything remote not already known locally, never removes or
  // overwrites what's already there.
  useEffect(() => {
    if (!userId) return;
    fetchMyBookings(userId).then((remote) => {
      if (remote) useApp.getState().hydrateBookings(remote);
    });
  }, [userId]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        <AuthSheet />
        <BookingSheet />
        <ReportSheet />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
