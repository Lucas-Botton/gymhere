import { create } from 'zustand';
import { TargetType } from '../types';

interface ReportSheetState {
  open: boolean;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  openSheet: (input: { targetType: TargetType; targetId: string; targetName: string }) => void;
  close: () => void;
}

export const useReportSheet = create<ReportSheetState>((set) => ({
  open: false,
  targetType: 'gym',
  targetId: '',
  targetName: '',
  openSheet: (input) => set({ open: true, ...input }),
  close: () => set({ open: false }),
}));
