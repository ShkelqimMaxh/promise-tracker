/**
 * Shadow System - Based on PromiseTracker Design System
 * React Native shadows work differently than CSS, so we provide both iOS and Android shadow styles
 * 
 * Cards: 0 4px 6px -1px rgb(0 0 0 / 0.08)
 * Elevated/Hover: 0 10px 15px -3px rgb(0 0 0 / 0.08)
 * Glow Effect: 0 0 20px rgba(20, 184, 166, 0.3) (teal glow)
 */

import { Platform } from 'react-native';

export const shadows = {
  // Small shadow
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),

  // Default shadow - Cards: 0 4px 6px -1px rgb(0 0 0 / 0.08)
  default: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),

  // Large shadow - Elevated/Hover: 0 10px 15px -3px rgb(0 0 0 / 0.08)
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 15,
    },
    android: {
      elevation: 8,
    },
  }),

  // Glow effect - Teal glow: 0 0 20px rgba(20, 184, 166, 0.3)
  glow: Platform.select({
    ios: {
      shadowColor: '#14b8a6', // teal-500
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    android: {
      elevation: 8,
      // Android doesn't support colored shadows well, so we use elevation
    },
  }),

  // Extra small shadow (for outline buttons)
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.02,
      shadowRadius: 1,
    },
    android: {
      elevation: 0.5,
    },
  }),
} as const;

export type ShadowKey = keyof typeof shadows;
