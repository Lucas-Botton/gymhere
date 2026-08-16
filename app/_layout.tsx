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
import AuthSheet from '../src/components/booking/AuthSheet';
import BookingSheet from '../src/components/booking/BookingSheet';
import Toast from '../src/components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import { useSession } from '../src/store/session';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
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
    supabase.auth.getSession().then(({ data }) => sync(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => sync(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        <AuthSheet />
        <BookingSheet />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
