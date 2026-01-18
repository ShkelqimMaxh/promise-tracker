/**
 * Logo Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

interface LogoProps {
  onPress?: () => void;
  showText?: boolean;
  size?: 'sm' | 'md';
}

export const Logo: React.FC<LogoProps> = ({ onPress, showText = true, size = 'md' }) => {
  const { theme } = useTheme();

  const iconSize = size === 'sm' ? 16 : 20;
  const containerSize = size === 'sm' ? 32 : 40;

  const content = (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Target size={iconSize} color={theme.colors.primaryForeground} />
      </View>
      {showText && (
        <Text
          style={[
            styles.text,
            {
              ...theme.typography.h4,
              color: theme.colors.foreground,
            },
          ]}
        >
          PromiseTracker
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
