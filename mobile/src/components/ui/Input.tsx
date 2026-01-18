/**
 * Input Component
 * Based on PromiseTracker Design System
 */

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  placeholderTextColor,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        style,
      ]}
      placeholderTextColor={placeholderTextColor || theme.colors.mutedForeground}
      {...props}
    />
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    input: {
      height: 48, // h-12
      width: '100%',
      borderRadius: theme.borderRadius.input || theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.input || theme.colors.border,
      backgroundColor: 'transparent',
      paddingHorizontal: theme.spacing[3],
      ...theme.typography.body,
      color: theme.colors.foreground,
      fontSize: theme.fontSizes.base,
    },
    inputError: {
      borderColor: theme.colors.destructive,
    },
  });
