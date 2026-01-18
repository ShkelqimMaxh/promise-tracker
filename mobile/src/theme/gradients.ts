/**
 * Gradient System - Based on PromiseTracker Design System
 * React Native uses LinearGradient from expo-linear-gradient
 * This file provides gradient configuration objects
 */

import { lightColors, darkColors } from './colors';

export type GradientConfig = {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

/**
 * Helper to convert HSL string to hex for gradients
 * Note: React Native LinearGradient works with hex colors
 */
const hslToHex = (hsl: string): string => {
  // For now, return HSL as-is since React Native can handle HSL in some cases
  // In production, you may want to convert to hex
  // This is a simplified version - full conversion would parse HSL values
  return hsl;
};

/**
 * Light mode gradients
 * Primary Accent: Teal-to-Cyan gradient #14b8a6 → #06b6d4
 */
export const lightGradients = {
  // Primary gradient (text): Teal-to-Cyan #14b8a6 → #06b6d4
  primaryText: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Hero background: Dark gradient #1e293b → #0f172a → #020617
  hero: {
    colors: ['#1e293b', '#0f172a', '#020617'], // slate-800 → slate-900 → slate-950
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Card gradient: subtle top-to-bottom
  card: {
    colors: [lightColors.card, 'hsla(200, 14%, 97%, 0.5)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Button gradient: Teal-to-Cyan #14b8a6 → #06b6d4
  button: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } as GradientConfig,

  // Section gradient: subtle vertical
  section: {
    colors: ['transparent', 'hsla(200, 14%, 97%, 0.5)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Number badge gradient: Teal-to-Cyan
  badge: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Avatar gradient: Teal-to-Cyan
  avatar: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Accent gradient: Teal-to-Cyan (for stats, trust score, etc.)
  accent: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } as GradientConfig,
} as const;

/**
 * Dark mode gradients
 * Primary Accent: Teal-to-Cyan gradient #14b8a6 → #06b6d4
 */
export const darkGradients = {
  // Primary gradient (text): Teal-to-Cyan #14b8a6 → #06b6d4
  primaryText: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Hero background: Dark gradient #1e293b → #0f172a → #020617
  hero: {
    colors: ['#1e293b', '#0f172a', '#020617'], // slate-800 → slate-900 → slate-950
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  card: {
    colors: [darkColors.card, 'hsla(222, 47%, 9%, 0.5)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Button gradient: Teal-to-Cyan #14b8a6 → #06b6d4
  button: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } as GradientConfig,

  section: {
    colors: ['transparent', 'hsla(210, 20%, 95%, 0.05)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Number badge gradient: Teal-to-Cyan
  badge: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Avatar gradient: Teal-to-Cyan
  avatar: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Accent gradient: Teal-to-Cyan (for stats, trust score, etc.)
  accent: {
    colors: ['#14b8a6', '#06b6d4'], // teal-500 to cyan-500
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  } as GradientConfig,
} as const;
