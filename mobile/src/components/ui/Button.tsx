/**
 * Button Component
 * Based on PromiseTracker Design System
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      ...theme.typography.buttonSmall,
    },
    md: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      ...theme.typography.button,
    },
    lg: {
      paddingHorizontal: theme.spacing[8],
      height: 56,
      ...theme.typography.buttonLarge,
    },
  };

  const getTextColor = () => {
    if (variant === 'primary') {
      return theme.colors.primaryForeground;
    }
    if (variant === 'outline') {
      return theme.colors.foreground;
    }
    return theme.colors.foreground;
  };

  if (variant === 'primary') {
    const gradient = theme.gradients.button;
    const baseStyle = [
      styles.button,
      sizeStyles[size],
      {
        borderRadius: theme.borderRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
    ];

    // Use LinearGradient on native, View with CSS gradient on web
    if (Platform.OS !== 'web') {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[
            {
              opacity: disabled ? 0.5 : 1,
              width: fullWidth ? '100%' : 'auto',
            },
            style,
          ]}
        >
          <LinearGradient
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
            style={baseStyle}
          >
            {loading ? (
              <ActivityIndicator color={getTextColor()} size="small" />
            ) : typeof children === 'string' ? (
              <Text
                style={[
                  sizeStyles[size],
                  {
                    color: getTextColor(),
                  },
                  textStyle,
                ]}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Fallback for web: use View with CSS gradient
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          {
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : 'auto',
          },
          style,
        ]}
      >
        <View
          style={[
            baseStyle,
            {
              backgroundColor: gradient.colors[0], // Use first gradient color as fallback
            },
            Platform.OS === 'web' && {
              // @ts-ignore - web-specific style
              backgroundImage: `linear-gradient(to right, ${gradient.colors.join(', ')})`,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={getTextColor()} size="small" />
          ) : typeof children === 'string' ? (
            <Text
              style={[
                sizeStyles[size],
                {
                  color: getTextColor(),
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        sizeStyles[size],
        {
          borderRadius: theme.borderRadius.button,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? theme.colors.border : 'transparent',
          backgroundColor: variant === 'ghost' ? 'transparent' : theme.colors.card,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        variant === 'outline' && theme.shadows.xs,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : typeof children === 'string' ? (
        <Text
          style={[
            sizeStyles[size],
            {
              color: getTextColor(),
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
