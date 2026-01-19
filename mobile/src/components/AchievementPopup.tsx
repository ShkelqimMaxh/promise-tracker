/**
 * AchievementPopup Component
 * Shows a celebration popup when an achievement is unlocked
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { useAchievements, Achievement } from '../contexts/AchievementContext';
import { X, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
}

export function AchievementPopup() {
  const { theme } = useTheme();
  const { pendingAchievement, dismissAchievement } = useAchievements();
  const styles = createStyles(theme);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(1)).current;
  const confettiPieces = useRef<ConfettiPiece[]>([]).current;

  // Initialize confetti
  useEffect(() => {
    if (confettiPieces.length === 0) {
      const colors = ['#14b8a6', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#22c55e'];
      for (let i = 0; i < 20; i++) {
        confettiPieces.push({
          x: new Animated.Value(SCREEN_WIDTH / 2),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          color: colors[i % colors.length],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (pendingAchievement) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      iconBounce.setValue(1);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounce, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();

      // Animate confetti
      confettiPieces.forEach((piece, index) => {
        piece.x.setValue(SCREEN_WIDTH / 2);
        piece.y.setValue(-20);
        piece.rotation.setValue(0);

        const delay = index * 50;
        const targetX = Math.random() * SCREEN_WIDTH;
        const duration = 1500 + Math.random() * 1000;

        Animated.parallel([
          Animated.timing(piece.x, {
            toValue: targetX,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.y, {
            toValue: Dimensions.get('window').height + 50,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 720 - 360,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [pendingAchievement]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissAchievement();
    });
  };

  if (!pendingAchievement) {
    return null;
  }

  return (
    <Modal
      visible={!!pendingAchievement}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiPieces.map((piece, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: piece.color,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  {
                    rotate: piece.rotation.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.popup,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={theme.mode === 'dark' 
              ? ['#1e293b', '#0f172a'] 
              : ['#ffffff', '#f8fafc']}
            style={styles.popupGradient}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
              <X size={20} color={theme.colors.mutedForeground} />
            </TouchableOpacity>

            {/* Achievement icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: iconBounce }] },
              ]}
            >
              <LinearGradient
                colors={['#14b8a6', '#06b6d4']}
                style={styles.iconGradient}
              >
                <Text style={styles.iconEmoji}>{pendingAchievement.icon}</Text>
              </LinearGradient>
            </Animated.View>

            {/* Sparkles */}
            <View style={styles.sparklesContainer}>
              <Sparkles size={24} color="#f59e0b" />
            </View>

            {/* Title */}
            <Text style={styles.achievementUnlocked}>Achievement Unlocked!</Text>
            <Text style={styles.achievementTitle}>{pendingAchievement.title}</Text>
            <Text style={styles.achievementDescription}>
              {pendingAchievement.description}
            </Text>

            {/* Category badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {pendingAchievement.category.toUpperCase()}
              </Text>
            </View>

            {/* Dismiss button */}
            <TouchableOpacity onPress={handleDismiss} activeOpacity={0.8}>
              <LinearGradient
                colors={['#14b8a6', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissButtonText}>Awesome!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    confetti: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    popup: {
      width: Math.min(SCREEN_WIDTH - 48, 360),
      borderRadius: 24,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        },
      }),
    },
    popupGradient: {
      padding: 32,
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: theme.colors.muted,
    },
    iconContainer: {
      marginBottom: 24,
    },
    iconGradient: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconEmoji: {
      fontSize: 48,
    },
    sparklesContainer: {
      position: 'absolute',
      top: 80,
      right: 60,
    },
    achievementUnlocked: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 8,
    },
    achievementTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.foreground,
      textAlign: 'center',
      marginBottom: 8,
    },
    achievementDescription: {
      fontSize: 16,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 24,
    },
    categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.muted,
      marginBottom: 24,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.mutedForeground,
      letterSpacing: 1,
    },
    dismissButton: {
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 999,
    },
    dismissButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#ffffff',
    },
  });
