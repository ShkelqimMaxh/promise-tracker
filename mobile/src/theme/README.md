# Theme System

This theme system is based on the PromiseTracker Design System and provides a complete styling foundation for the React Native app.

## Structure

- **colors.ts** - Color palette for light and dark modes
- **spacing.ts** - Spacing scale (4px base unit)
- **typography.ts** - Font families, sizes, weights, and typography scale
- **borderRadius.ts** - Border radius values
- **shadows.ts** - Shadow styles for iOS and Android
- **gradients.ts** - Gradient configurations
- **ThemeProvider.tsx** - React context provider for theme management
- **utils.ts** - Utility functions for working with theme values
- **index.ts** - Main theme export

## Usage

### Basic Usage

```tsx
import { useTheme } from './src/theme/ThemeProvider';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.foreground }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Using Colors

```tsx
const { theme } = useTheme();

// Access colors
theme.colors.primary
theme.colors.accent
theme.colors.success
theme.colors.destructive
```

### Using Spacing

```tsx
const { theme } = useTheme();

// Use spacing values
padding: theme.spacing[4] // 16px
margin: theme.spacingPatterns.cardPadding // 16px
gap: theme.spacingPatterns.gapMedium // 12px
```

### Using Typography

```tsx
const { theme } = useTheme();

// Apply typography styles
<Text style={theme.typography.h1}>Heading 1</Text>
<Text style={theme.typography.body}>Body text</Text>
<Text style={theme.typography.button}>Button text</Text>
```

### Using Border Radius

```tsx
const { theme } = useTheme();

borderRadius: theme.borderRadius.card // 12px
borderRadius: theme.borderRadius.button // 6px
borderRadius: theme.borderRadius.full // 9999px (circular)
```

### Using Shadows

```tsx
const { theme } = useTheme();

// Shadows work on both iOS and Android
<View style={[styles.card, theme.shadows.lg]}>
  {/* Card content */}
</View>
```

### Using Gradients

Gradients require `expo-linear-gradient`. Install it first:

```bash
npx expo install expo-linear-gradient
```

Then use it:

```tsx
import LinearGradient from 'expo-linear-gradient';
import { useTheme } from './src/theme/ThemeProvider';

function GradientButton() {
  const { theme } = useTheme();
  const gradient = theme.gradients.button;

  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={styles.button}
    >
      <Text style={[theme.typography.button, { color: theme.colors.primaryForeground }]}>
        Button
      </Text>
    </LinearGradient>
  );
}
```

### Toggling Theme

```tsx
import { useTheme } from './src/theme/ThemeProvider';

function ThemeToggle() {
  const { mode, toggleTheme, setTheme } = useTheme();

  return (
    <Button onPress={toggleTheme}>
      Switch to {mode === 'light' ? 'dark' : 'light'} mode
    </Button>
  );
}
```

## Theme Modes

The theme supports two modes:
- **light** - Light mode colors
- **dark** - Dark mode colors

The ThemeProvider can be set to:
- **'auto'** - Automatically follows system color scheme (default)
- **'light'** - Always light mode
- **'dark'** - Always dark mode

## Color System

All colors are defined in HSL format which React Native supports natively. The color system includes:

- Primary colors (background, foreground, border, card)
- Brand colors (primary, accent)
- Secondary colors (secondary, muted)
- Status colors (success, warning, destructive)
- Input/Form colors
- Chart colors

## Typography System

Two font families are used:
- **Plus Jakarta Sans** - For display/headings (weights: 600, 700, 800)
- **Inter** - For body/UI text (weights: 400, 500, 600, 700)

Fonts need to be loaded using `expo-font`. Use the `useFonts` hook from `src/utils/useFonts.ts` to load fonts.

## Spacing System

Based on 4px base unit (Tailwind spacing scale):
- 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), etc.

Common spacing patterns are also provided in `spacingPatterns` for convenience.

## Notes

- React Native supports HSL colors directly, so no conversion is needed
- Shadows work differently on iOS (shadowColor/shadowOffset/shadowOpacity) vs Android (elevation)
- Gradients require `expo-linear-gradient` package
- Fonts need to be loaded via `expo-font` before use
