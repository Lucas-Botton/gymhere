import { useLocationStore } from '../store/location';
import { haversineKm } from './filters';
import { Gym } from '../types';

// Real distance from the device's live position when we have it (granted +
// fetched), falling back to the gym's demo-data distance otherwise so the
// app is still fully browsable before location is granted.
export function useGymDistanceKm(gym: Gym): number {
  const coords = useLocationStore((s) => s.coords);
  if (!coords) return gym.distanceKm;
  return haversineKm(coords, { lat: gym.lat, lng: gym.lng });
}

export function useMeCoords() {
  return useLocationStore((s) => s.coords);
}
