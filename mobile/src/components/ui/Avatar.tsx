/**
 * Avatar Component
 * Based on PromiseTracker Design System
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

export interface AvatarProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  fallbackStyle?: TextStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  size = 'md',
  style,
  fallbackStyle,
}) => {
  const { theme } = useTheme();

  const sizeMap = {
    sm: 36,
    md: 40,
    lg: 96,
  };

  const avatarSize = sizeMap[size];
  const fontSize = size === 'lg' ? theme.fontSizes.base : theme.fontSizes.sm;

  const content = typeof children === 'string' ? (() => {
    const gradient = theme.gradients.avatar;
    const baseStyle = [
      styles.avatar,
      {
        width: avatarSize,
        height: avatarSize,
        borderRadius: size === 'lg' ? theme.borderRadius.avatarXLarge : theme.borderRadius.avatar,
      },
    ];

    if (Platform.OS !== 'web') {
      return (
        <LinearGradient
          colors={gradient.colors}
          start={gradient.start}
          end={gradient.end}
          style={baseStyle}
        >
          <Text
            style={[
              {
                color: theme.colors.primaryForeground,
                fontSize,
                fontWeight: theme.fontWeights.bold,
              },
              fallbackStyle,
            ]}
          >
            {children}
          </Text>
        </LinearGradient>
      );
    }

    // Fallback for web: use View with background color
    return (
      <View
        style={[
          ...baseStyle,
          {
            backgroundColor: gradient.colors[0], // Use first gradient color as fallback
          },
          Platform.OS === 'web' && {
            // @ts-ignore - web-specific style
            backgroundImage: `linear-gradient(to bottom right, ${gradient.colors.join(', ')})`,
          },
        ]}
      >
        <Text
          style={[
            {
              color: theme.colors.primaryForeground,
              fontSize,
              fontWeight: theme.fontWeights.bold,
            },
            fallbackStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    );
  })() : (
    children
  );

  return (
    <View
      style={[
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: size === 'lg' ? theme.borderRadius.avatarXLarge : theme.borderRadius.avatar,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
