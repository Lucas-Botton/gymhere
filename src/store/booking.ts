import { create } from 'zustand';
import { BookingKind, BookingMode, TargetType } from '../types';

interface BookingSheetState {
  open: boolean;
  kind: BookingKind;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  sub: string;
  mode: BookingMode;
  coachId: string | null;
  serviceKey: string | null;
  openSheet: (input: Omit<Partial<BookingSheetState>, 'open'> & { kind: BookingKind; targetType: TargetType; targetId: string; targetName: string; mode: BookingMode }) => void;
  close: () => void;
}

export const useBookingSheet = create<BookingSheetState>((set) => ({
  open: false,
  kind: 'essai',
  targetType: 'gym',
  targetId: '',
  targetName: '',
  sub: '',
  mode: 'slot',
  coachId: null,
  serviceKey: null,
  openSheet: (input) =>
    set({
      open: true,
      sub: '',
      coachId: null,
      serviceKey: null,
      ...input,
    }),
  close: () => set({ open: false }),
}));
