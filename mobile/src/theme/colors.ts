/**
 * Color System - Based on PromiseTracker Design System
 * All colors are defined in HSL format for React Native
 */

export const lightColors = {
  // Primary Colors
  background: 'hsl(200, 14%, 97%)', // #f5f7f8 - light cool gray
  foreground: 'hsl(225, 47%, 12%)', // #0f172a - deep slate
  border: 'hsl(214, 32%, 91%)', // #e2e8f0 - soft gray
  card: 'hsl(0, 0%, 100%)', // #ffffff - white
  cardForeground: 'hsl(225, 47%, 12%)', // #0f172a - deep slate

  // Primary Brand
  primary: 'hsl(174, 80%, 40%)', // #14b8a6 - teal-500 (accent solid)
  primaryForeground: 'hsl(0, 0%, 100%)', // white
  accent: 'hsl(174, 80%, 40%)', // #14b8a6 - teal-500
  accentForeground: 'hsl(0, 0%, 100%)', // white

  // Secondary Colors
  secondary: 'hsl(214, 32%, 91%)', // #e2e8f0 - muted background
  secondaryForeground: 'hsl(225, 47%, 12%)', // #0f172a
  muted: 'hsl(214, 32%, 91%)', // #e2e8f0 - muted background
  mutedForeground: 'hsl(215, 16%, 47%)', // #64748b - slate-500

  // Status Colors
  success: 'hsl(174, 80%, 40%)', // teal (using accent for success)
  successForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 50%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  destructive: 'hsl(0, 85%, 60%)', // #ef4444 - red-500
  destructiveForeground: 'hsl(0, 0%, 100%)',

  // Input/Form
  input: 'hsl(214, 32%, 91%)', // #e2e8f0
  ring: 'hsl(174, 80%, 40%)', // teal accent

  // Chart Colors
  chart1: 'hsl(174, 80%, 40%)', // teal
  chart2: 'hsl(189, 95%, 42%)', // cyan #06b6d4
  chart3: 'hsl(173, 58%, 39%)',
  chart4: 'hsl(197, 71%, 52%)',
  chart5: 'hsl(43, 96%, 56%)',
} as const;

export const darkColors = {
  // Primary Colors
  background: 'hsl(222, 47%, 6%)', // slate-950 #020617
  foreground: 'hsl(210, 20%, 95%)',
  border: 'hsla(215, 25%, 27%, 0.5)', // rgba(51, 65, 85, 0.5) - slate-700/50
  card: 'hsl(222, 47%, 9%)', // slate-900 #0f172a
  cardForeground: 'hsl(210, 20%, 95%)',

  // Primary Brand
  primary: 'hsl(174, 80%, 40%)', // teal-500 #14b8a6
  primaryForeground: 'hsl(0, 0%, 100%)',
  accent: 'hsl(174, 80%, 40%)', // teal-500 #14b8a6
  accentForeground: 'hsl(0, 0%, 100%)',

  // Secondary Colors
  secondary: 'hsl(217, 33%, 15%)', // slate-800 #1e293b
  secondaryForeground: 'hsl(210, 20%, 90%)',
  muted: 'hsl(217, 33%, 12%)',
  mutedForeground: 'hsl(215, 20%, 65%)', // #94a3b8 - slate-400

  // Status Colors
  success: 'hsl(174, 80%, 40%)', // teal
  successForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 88%, 55%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  destructive: 'hsl(0, 85%, 60%)', // #ef4444 - red-500
  destructiveForeground: 'hsl(0, 0%, 100%)',

  // Input/Form
  input: 'hsl(217, 33%, 18%)',
  ring: 'hsl(174, 80%, 40%)', // teal accent

  // Chart Colors
  chart1: 'hsl(174, 80%, 40%)', // teal
  chart2: 'hsl(189, 95%, 42%)', // cyan #06b6d4
  chart3: 'hsl(173, 58%, 39%)',
  chart4: 'hsl(197, 71%, 52%)',
  chart5: 'hsl(43, 96%, 56%)',
} as const;

export type ColorKeys = keyof typeof lightColors;
export type Colors = typeof lightColors;
