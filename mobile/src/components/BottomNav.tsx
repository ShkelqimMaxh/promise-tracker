import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Plus, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const navItems = [
  { path: '/promises', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/create', icon: Plus, label: 'Create' },
  { path: '/profile', icon: User, label: 'Profile' },
];

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ currentRoute, onNavigate }: BottomNavProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const safeInsets = {
    bottom: insets?.bottom ?? 0,
  };

  const styles = createStyles(theme, safeInsets);

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.path;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => onNavigate(item.path.replace('/', ''))}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  useAnimatedStyle(() => ({
                    opacity: withTiming(isActive ? 1 : 0, { duration: 200 }),
                  })),
                ]}
              />
              <Icon
                size={24}
                color={isActive ? '#16B8A7' : theme.colors.mutedForeground}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? '#16B8A7' : theme.colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: any, insets: { bottom: number }) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: Platform.OS === 'web' 
        ? (theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)')
        : theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: (insets?.bottom ?? 0) - 10, // -10px to move footer up
      ...Platform.select({
        web: {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      }),
    },
    navContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      maxWidth: 512, // max-w-lg
      alignSelf: 'center',
      width: '100%',
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[6],
      borderRadius: theme.borderRadius.xl,
      position: 'relative',
    },
    activeIndicator: {
      position: 'absolute',
      inset: 0,
      backgroundColor: theme.mode === 'dark' ? 'rgba(20, 184, 166, 0.15)' : '#EAF6F5', // Light teal background for active tab
      borderRadius: theme.borderRadius.xl,
    },
    label: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '500',
      marginTop: theme.spacing[1],
    },
  });
}
