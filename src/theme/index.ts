// Design tokens v2 — palette "Électrique" (DESIGN-V2-SPECS.md).
// Any visual decision should trace back to a value defined here.

export const colors = {
  // Brand gradient (left -> right): rose vif -> rose primaire -> violet -> indigo -> menthe
  coral: '#FF3D7F',
  pink: '#FF1F6B',
  violet: '#C81FFF',
  violetDeep: '#C81FFF',
  blue: '#4D5BFF',
  brandBlue: '#4D5BFF',
  mint: '#00E5C0',
  mintDeep: '#00E5C0',
  lime: '#C6FF3D',

  ink: '#140E1F',
  ink700: '#2A2036',
  textMuted: '#6B6478',
  textLight: '#A79FB0',
  textFaint: '#CFC8D6',

  white: '#FFFFFF',
  bgTint: '#FBF8FC',
  bgTint2: '#F5F0F8',
  border: '#EFE9F3',
  borderSoft: '#EFE9F3',

  success: '#00E5C0',
  successDeep: '#0E9E86',
  successBg: '#E6F7F2',
  successBorder: '#CFEDE6',

  warning: '#C97A12',
  warningBg: '#FFF3E2',

  danger: '#D92D5E',
  dangerBg: '#FFE9F0',

  tagBg: '#F3E6FF',
  tagText: '#9A1FD6',

  equipBg: '#FFE9F1',
  equipText: '#E01060',

  indigoBg: '#E9ECFF',
  indigoText: '#3A45E0',
  mintBg: '#DEFAF3',
  mintText: '#04A88E',
  limeBg: '#EEFCD6',
  limeText: '#5C8A00',
} as const;

export const gradients = {
  // Dégradé signature v2 (100°): #FF3D7F -> #FF1F6B (24%) -> #C81FFF (58%) -> #4D5BFF (84%) -> #00E5C0 (100%)
  brand: ['#FF3D7F', '#FF1F6B', '#C81FFF', '#4D5BFF', '#00E5C0'] as const,
  brandLocations: [0, 0.24, 0.58, 0.84, 1] as const,
  pinkViolet: [colors.pink, colors.violet] as const,
  violetBlue: [colors.violet, colors.blue] as const,
  blueMint: [colors.blue, colors.mint] as const,
  coralPink: [colors.coral, colors.pink] as const,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
  sheet: 28,
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

// Recipes ported from the real mockup's CSS box-shadow values (Jimmy.dc.html /
// gymmap.html), converted to RN's offset+radius+opacity model. The mockup
// leans on tight, close, high-opacity shadows (negative CSS spread) rather
// than soft diffuse ones — that's what reads as "premium" instead of "flat".
export const shadow = {
  soft: {
    shadowColor: '#280A32',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  card: {
    shadowColor: '#280A32',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#280A32',
    shadowOpacity: 0.38,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  glowPink: {
    shadowColor: colors.pink,
    shadowOpacity: 0.55,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glowViolet: {
    shadowColor: colors.violet,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  glowMint: {
    shadowColor: colors.mint,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  glowBlue: {
    shadowColor: colors.blue,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
} as const;

// A shadow extends beyond its element by roughly shadowOffset + shadowRadius —
// for shadow.card that's ~17px below, ~11px sideways. Any horizontal
// ScrollView holding shadow.soft/shadow.card items needs at least this much
// paddingVertical in its contentContainerStyle (offset by the same negative
// marginVertical on the ScrollView itself, so it doesn't add visible gap)
// or the shadow gets clipped by the scroll viewport into a hard, ugly edge
// instead of fading out naturally.
export const shadowBleed = 20;

export const fontWeight = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// v2: Gabarito carries titles/big numbers/button labels (weight="black"),
// Nunito stays for everything else — body, meta, small labels, chips/tags.
// This single mapping is deliberately what makes the whole app switch to
// the new title face without touching every screen's <Text weight="black">.
export const fontFamily = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Gabarito_800ExtraBold',
};

// Extra display-face slots for spots that need Gabarito at a specific
// weight outside the weight="black" mapping above (wordmark, splash).
export const displayFont = {
  regular: 'Gabarito_400Regular',
  medium: 'Gabarito_500Medium',
  semibold: 'Gabarito_600SemiBold',
  bold: 'Gabarito_700Bold',
  extrabold: 'Gabarito_800ExtraBold',
  black: 'Gabarito_900Black',
};

export const type = {
  h1: { fontFamily: fontFamily.black, fontSize: 26, letterSpacing: -0.9 },
  h2: { fontFamily: fontFamily.black, fontSize: 20, letterSpacing: -0.7 },
  h3: { fontFamily: fontFamily.extrabold, fontSize: 17 },
  body: { fontFamily: fontFamily.semibold, fontSize: 14.5 },
  bodyBold: { fontFamily: fontFamily.extrabold, fontSize: 14.5 },
  meta: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  small: { fontFamily: fontFamily.bold, fontSize: 11 },
};
