// Design tokens ported 1:1 from the gymhere mockup (Jimmy.dc.html).
// Any visual decision should trace back to a value defined here.

export const colors = {
  // Brand gradient (left -> right): corail -> rose vif -> violet -> bleu -> menthe
  coral: '#FF4E7D',
  pink: '#F5397F',
  violet: '#8B5CFF',
  violetDeep: '#A54BFF',
  blue: '#4F6EF7',
  mint: '#2FD4C0',
  mintDeep: '#28D8C4',

  ink: '#1A1024',
  textMuted: '#8A8194',
  textLight: '#B4AEBE',

  white: '#FFFFFF',
  bgTint: '#FBF7FA',
  bgTint2: '#F4EFF6',
  border: '#EFEAF0',
  borderSoft: '#ECE6F0',

  success: '#12B39A',
  successDeep: '#0E8C79',
  successBg: '#EAF8F5',
  successBorder: '#CFEDE6',

  warning: '#B5730A',
  warningBg: '#FFF4E5',

  danger: '#D14343',
  dangerBg: '#FDECEC',

  tagBg: '#F7F1FA',
  tagText: '#6B4E86',

  equipBg: '#FDECF3',
  equipText: '#F5397F',
} as const;

export const gradients = {
  brand: [colors.coral, colors.pink, colors.violetDeep, colors.mintDeep] as const,
  brandLocations: [0, 0.35, 0.7, 1] as const,
  pinkViolet: [colors.pink, colors.violet] as const,
  violetBlue: [colors.violet, colors.blue] as const,
  blueMint: [colors.blue, colors.mint] as const,
  coralPink: ['#FF6B6B', colors.pink] as const,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const shadow = {
  soft: {
    shadowColor: '#280A32',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  card: {
    shadowColor: '#280A32',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#280A32',
    shadowOpacity: 0.28,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
} as const;

export const fontWeight = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const fontFamily = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const type = {
  h1: { fontFamily: fontFamily.black, fontSize: 26, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamily.black, fontSize: 20, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamily.extrabold, fontSize: 17 },
  body: { fontFamily: fontFamily.semibold, fontSize: 14.5 },
  bodyBold: { fontFamily: fontFamily.extrabold, fontSize: 14.5 },
  meta: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  small: { fontFamily: fontFamily.bold, fontSize: 11 },
};
