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
  const [isFocused, setIsFocused] = React.useState(false);
  const styles = createStyles(theme, isFocused, error);

  return (
    <TextInput
      style={[
        styles.input,
        style,
      ]}
      placeholderTextColor={placeholderTextColor || theme.colors.mutedForeground}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
};

const createStyles = (theme: any, isFocused: boolean, error?: string) =>
  StyleSheet.create({
    input: {
      height: 48, // h-12
      width: '100%',
      borderRadius: theme.borderRadius.input || theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: error 
        ? theme.colors.destructive 
        : theme.colors.primary, // Always use teal border
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing[3],
      ...theme.typography.body,
      color: theme.colors.foreground,
      fontSize: theme.fontSizes.base,
      ...Platform.select({
        web: {
          outline: 'none',
          outlineWidth: 0,
          outlineStyle: 'none',
          borderStyle: 'solid',
          boxShadow: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        },
      }),
    },
  });
