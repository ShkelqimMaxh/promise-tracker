/**
 * Typography System - Based on PromiseTracker Design System
 */

// Font families
// Note: In React Native, fonts need to be loaded via expo-font
// These will be the font family names after loading
export const fontFamilies = {
  sans: 'Inter, system-ui, sans-serif', // Body/UI: Inter
  display: 'Plus Jakarta Sans, system-ui, sans-serif', // Display/Headings: Plus Jakarta Sans
  button: 'Inter, system-ui, sans-serif', // Buttons use Inter
  system: 'System', // Fallback
} as const;

// Font weights
export const fontWeights = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
} as const;

// Font sizes (in pixels)
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '7xl': 72,
} as const;

// Line heights
export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.625,
} as const;

// Letter spacing
export const letterSpacing = {
  tight: -0.025, // For headings
  normal: -0.01, // For body text
  none: 0,
} as const;

/**
 * Typography scale based on design system
 * Display/Headings: Plus Jakarta Sans (600, 700, 800)
 * Body/UI: Inter (400, 500, 600, 700)
 */
export const typography = {
  // Headings - Plus Jakarta Sans
  h1: {
    fontSize: fontSizes['5xl'], // 48px - Hero Title (5xl-7xl range)
    fontFamily: fontFamilies.display,
    fontWeight: fontWeights.extraBold, // 800
    letterSpacing: letterSpacing.none, // Normal (0em)
  },
  h1Hero: {
    fontSize: fontSizes['7xl'], // 72px - Hero Title max
    fontFamily: fontFamilies.display,
    fontWeight: fontWeights.extraBold, // 800
    letterSpacing: letterSpacing.none, // Normal (0em)
  },
  h2: {
    fontSize: fontSizes.xl, // 20px - Page Title
    fontFamily: fontFamilies.display,
    fontWeight: fontWeights.bold, // 700
    letterSpacing: letterSpacing.none,
  },
  h3: {
    fontSize: fontSizes.lg, // 18px - Section Heading / Card Title
    fontFamily: fontFamilies.display,
    fontWeight: fontWeights.semiBold, // 600
    letterSpacing: letterSpacing.none,
  },
  h4: {
    fontSize: fontSizes.lg, // 18px - Section Heading
    fontFamily: fontFamilies.display,
    fontWeight: fontWeights.semiBold, // 600
    letterSpacing: letterSpacing.none,
  },

  // Body text - Inter
  bodyLarge: {
    fontSize: fontSizes.xl, // 20px
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.regular, // 400
    letterSpacing: letterSpacing.none,
  },
  body: {
    fontSize: fontSizes.base, // 16px - Body
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.regular, // 400
    letterSpacing: letterSpacing.none,
  },
  bodySmall: {
    fontSize: fontSizes.sm, // 14px - Small/Labels
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.medium, // 500
    letterSpacing: letterSpacing.none,
  },
  bodyXSmall: {
    fontSize: fontSizes.xs, // 12px - Tiny/Captions
    fontFamily: fontFamilies.sans,
    fontWeight: fontWeights.regular, // 400
    letterSpacing: letterSpacing.none,
  },

  // Button text - Inter
  buttonLarge: {
    fontSize: fontSizes.lg, // 18px
    fontFamily: fontFamilies.button,
    fontWeight: fontWeights.medium, // 500
    letterSpacing: letterSpacing.none,
  },
  button: {
    fontSize: fontSizes.base, // 16px
    fontFamily: fontFamilies.button,
    fontWeight: fontWeights.medium, // 500
    letterSpacing: letterSpacing.none,
  },
  buttonSmall: {
    fontSize: fontSizes.sm, // 14px
    fontFamily: fontFamilies.button,
    fontWeight: fontWeights.medium, // 500
    letterSpacing: letterSpacing.none,
  },
  buttonXSmall: {
    fontSize: fontSizes.xs, // 12px
    fontFamily: fontFamilies.button,
    fontWeight: fontWeights.medium, // 500
    letterSpacing: letterSpacing.none,
  },
} as const;

export type TypographyKey = keyof typeof typography;
