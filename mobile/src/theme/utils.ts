/**
 * Theme Utility Functions
 * Helper functions for working with theme values
 */

import { spacing, type SpacingKey } from './spacing';
import { borderRadius, type BorderRadiusKey } from './borderRadius';
import { shadows, type ShadowKey } from './shadows';

/**
 * Get spacing value safely
 */
export const getSpacing = (key: SpacingKey | number): number => {
  if (typeof key === 'number') return key;
  return spacing[key];
};

/**
 * Get border radius value safely
 */
export const getBorderRadius = (key: BorderRadiusKey | number): number => {
  if (typeof key === 'number') return key;
  return borderRadius[key];
};

/**
 * Get shadow styles safely
 */
export const getShadow = (key: ShadowKey = 'default') => {
  return shadows[key] || shadows.default;
};

/**
 * Convert HSL string to color object for React Native
 * React Native can handle HSL strings directly in most cases
 * but this utility can be used for validation or conversion if needed
 */
export const parseHSL = (hsl: string): string => {
  // For now, just return the HSL string as React Native supports it
  // If conversion to RGB is needed, implement HSL to RGB conversion here
  return hsl;
};

/**
 * Create a color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // If color is already HSL, convert to HSLA
  if (color.startsWith('hsl(') && !color.startsWith('hsla(')) {
    return color.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`);
  }
  // If color is already HSLA, update opacity
  if (color.startsWith('hsla(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
  }
  // For other formats, return as-is (may need RGB/RGBA conversion)
  return color;
};

/**
 * Responsive font size helper
 * Returns an object with fontSize property based on screen size
 */
export const responsiveFontSize = (
  mobile: number,
  tablet?: number,
  desktop?: number
): { fontSize: number } => {
  // For now, just return mobile size
  // In a real implementation, you'd use Dimensions or a hook to detect screen size
  return { fontSize: mobile };
};
