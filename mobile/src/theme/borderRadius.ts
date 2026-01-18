/**
 * Border Radius System - Based on PromiseTracker Design System
 */

export const borderRadius = {
  // Base variations
  small: 8, // Small Elements (rounded-lg)
  medium: 12, // Cards (rounded-xl)
  large: 16, // Large Cards/Modals (rounded-2xl)
  xLarge: 24, // Hero Sections (rounded-3xl)

  // Common Tailwind equivalents
  none: 0,
  sm: 8,
  md: 12,
  lg: 12, // Cards
  xl: 16, // Large Cards
  '2xl': 16, // Large Cards/Modals
  '3xl': 24, // Hero Sections
  full: 9999, // Circular/rounded-full (Pills/Badges)

  // Common usage patterns
  button: 12, // rounded-xl
  card: 12, // rounded-xl
  cardLarge: 16, // rounded-2xl
  cardXLarge: 24, // rounded-3xl
  input: 12, // rounded-xl
  avatar: 16, // rounded-2xl
  avatarLarge: 16, // rounded-2xl
  avatarXLarge: 16, // rounded-2xl
  badge: 9999, // rounded-full (Pills/Badges)
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
