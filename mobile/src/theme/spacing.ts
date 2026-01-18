/**
 * Spacing System - Based on PromiseTracker Design System
 * Uses 4px base unit (Tailwind spacing scale)
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export type SpacingKey = keyof typeof spacing;

/**
 * Get spacing value
 */
export const getSpacing = (key: SpacingKey): number => spacing[key];

/**
 * Common spacing patterns
 * Base Unit: 4px (0.25rem)
 */
export const spacingPatterns = {
  // Padding
  cardPadding: spacing[4], // 16px - Card Padding
  cardPaddingLarge: spacing[5], // 20px - Card Padding (larger)
  cardPaddingCompact: 10, // 10px - Compact Card Padding (p-2.5)
  cardPaddingXLarge: spacing[6], // 24px
  sectionPadding: spacing[20], // 80px
  sectionPaddingLarge: spacing[24], // 96px
  containerPadding: spacing[4], // 16px - Page Horizontal Padding (px-4)
  containerPaddingLarge: spacing[6], // 24px - Page Vertical Padding (py-6)
  buttonPaddingX: spacing[4], // 16px horizontal
  buttonPaddingY: spacing[2], // 8px vertical
  buttonPaddingXLarge: spacing[8], // 32px horizontal
  inputPadding: spacing[4], // 16px
  inputPaddingWithIcon: 44, // pl-11 equivalent
  bottomNavSafeArea: spacing[24], // 96px - Bottom Nav Safe Area (pb-24)

  // Gaps
  gapSmall: spacing[1], // 4px
  gapSmallMedium: spacing[2], // 8px - Element Gap (gap-2)
  gapMedium: spacing[3], // 12px
  gapMediumLarge: spacing[4], // 16px - Element Gap (gap-4)
  gapLarge: spacing[6], // 24px - Section Gap (gap-6)
  gapXLarge: spacing[8], // 32px

  // Margins
  marginSmall: spacing[1], // 4px
  marginSmallMedium: spacing[2], // 8px
  marginMedium: spacing[4], // 16px
  marginLarge: spacing[6], // 24px
  marginXLarge: spacing[8], // 32px
  marginXXLarge: spacing[16], // 64px
} as const;
