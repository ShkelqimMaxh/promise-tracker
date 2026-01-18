/**
 * Label Component
 * Based on PromiseTracker Design System
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, style, required }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Text style={[styles.label, style]}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    label: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      color: theme.colors.foreground,
      marginBottom: theme.spacing[2],
    },
    required: {
      color: theme.colors.destructive,
    },
  });
