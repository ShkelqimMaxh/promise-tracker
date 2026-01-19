/**
 * ThemeToggle Component
 * A button to toggle between light/dark/auto themes
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme, ThemePreference } from '../theme/ThemeProvider';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: number;
}

export function ThemeToggle({ showLabel = false, size = 20 }: ThemeToggleProps) {
  const { theme, mode, preference, cycleTheme } = useTheme();

  const getIcon = () => {
    if (preference === 'auto') {
      return <Monitor size={size} color={theme.colors.foreground} />;
    }
    if (mode === 'dark') {
      return <Moon size={size} color={theme.colors.foreground} />;
    }
    return <Sun size={size} color={theme.colors.foreground} />;
  };

  const getLabel = (): string => {
    if (preference === 'auto') return 'Auto';
    if (preference === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <TouchableOpacity
      onPress={cycleTheme}
      style={[styles.button, { backgroundColor: theme.colors.muted }]}
      activeOpacity={0.7}
    >
      {getIcon()}
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>
          {getLabel()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
        transition: 'background-color 0.2s',
      },
    }),
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
