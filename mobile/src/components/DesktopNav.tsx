/**
 * DesktopNav - Navigation links for Create and Profile on desktop (web).
 * Shows Promises | Create | Profile for quick switching.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface DesktopNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const items = [
  { path: '/promises', label: 'Promises' },
  { path: '/create', label: 'Create' },
  { path: '/profile', label: 'Profile' },
];

export function DesktopNav({ currentRoute, onNavigate }: DesktopNavProps) {
  const { theme } = useTheme();

  if (Platform.OS !== 'web') {
    return null;
  }

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = currentRoute === item.path || currentRoute === `${item.path}/`;
        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => onNavigate(item.path.replace('/', ''))}
            style={styles.link}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[6],
    },
    link: {
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
    },
    linkText: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      color: theme.colors.mutedForeground,
    },
    linkTextActive: {
      color: theme.colors.foreground,
      fontWeight: theme.fontWeights.semibold,
    },
  });
}
