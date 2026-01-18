/**
 * Progress Component
 * Based on PromiseTracker Design System
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ProgressProps {
  value: number; // 0-100
  height?: number;
  style?: object;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  height = 8,
  style,
}) => {
  const { theme } = useTheme();

  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: theme.colors.muted,
          borderRadius: theme.borderRadius.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedValue}%`,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
