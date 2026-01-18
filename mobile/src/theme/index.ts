/**
 * Main Theme Export
 * Combines all theme tokens into a cohesive theme object
 */

import { lightColors, darkColors, type Colors } from './colors';
import { spacing, spacingPatterns } from './spacing';
import { typography, fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';
import { lightGradients, darkGradients, type GradientConfig } from './gradients';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: Colors;
  spacing: typeof spacing;
  spacingPatterns: typeof spacingPatterns;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  letterSpacing: typeof letterSpacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  gradients: Record<string, GradientConfig>;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  spacingPatterns,
  typography,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  borderRadius,
  shadows,
  gradients: lightGradients,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  spacingPatterns,
  typography,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  borderRadius,
  shadows,
  gradients: darkGradients,
};

// Export all individual theme modules
export { lightColors, darkColors } from './colors';
export { spacing, spacingPatterns } from './spacing';
export { typography, fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
export { borderRadius } from './borderRadius';
export { shadows } from './shadows';
export { lightGradients, darkGradients } from './gradients';

// Default theme export (light mode)
export default lightTheme;
