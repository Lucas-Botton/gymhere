import { create } from 'zustand';
import * as Location from 'expo-location';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: Coords | null;
  status: 'undetermined' | 'granted' | 'denied';
  loading: boolean;
  requestAndFetch: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  status: 'undetermined',
  loading: false,

  requestAndFetch: async () => {
    set({ loading: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ status: 'denied', loading: false });
        return false;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({
        status: 'granted',
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        loading: false,
      });
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  refresh: async () => {
    if (get().status !== 'granted') return;
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({ coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
    } catch {}
  },
}));
