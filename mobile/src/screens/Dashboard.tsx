/**
 * Dashboard / Landing Page
 * Converted from Promise-Tracker-1 Landing page
 * Screen that contains: "Keep Your Promises."
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/ui/Button';
import { fontFamilies } from '../theme/typography';
import {
  Target,
  Crosshair,
  BarChart3,
  Users,
  CheckCircle,
  Flame,
  ArrowRight,
  Shield,
} from 'lucide-react-native';

interface DashboardProps {
  onNavigate?: (route: string) => void;
}

const features = [
  {
    icon: Target,
    title: 'Set Clear Goals',
    description: 'Create promises with deadlines and break them into actionable milestones.',
  },
  {
    icon: Users,
    title: 'Stay Accountable',
    description: 'Add accountability partners for social promises to keep you on track.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Visual progress bars and check-ins help you see how far you\'ve come.',
  },
  {
    icon: Shield,
    title: 'Build Trust',
    description: 'Your Trust Score grows with every promise kept, building credibility.',
  },
];

const stats = [
  { value: '100%', label: 'Free to Use' },
  { value: '24/7', label: 'Always Available' },
  { value: '∞', label: 'Unlimited Promises' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  // Accent color for badges and highlights
  const accentColor = '#2ECDA9'; // hsl(174, 80%, 40%) equivalent
  const styles = createStyles(theme, insets);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const badgeFadeAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const descriptionFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;
  const statsAnimations = useRef(
    stats.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(20),
    }))
  ).current;
  const featuresAnimations = useRef(
    features.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(20),
    }))
  ).current;

  useEffect(() => {
    // Hero section animations
    Animated.parallel([
      Animated.timing(badgeFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(descriptionFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Stats animations
    statsAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 500,
          delay: 400 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.slide, {
          toValue: 0,
          duration: 500,
          delay: 400 + index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Features animations
    featuresAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 500,
          delay: 500 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.slide, {
          toValue: 0,
          duration: 500,
          delay: 500 + index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Crosshair size={20} color={theme.colors.primaryForeground} />
            </View>
            <Text style={styles.logoText}>PromiseTracker</Text>
          </View>
          <View style={styles.headerButtons}>
            {Platform.OS === 'web' && (
              <Button
                variant="ghost"
                onPress={() => onNavigate?.('signin')}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonGhostText}>Sign In</Text>
              </Button>
            )}
            <TouchableOpacity
              onPress={() => onNavigate?.('signin')}
              style={styles.headerButtonPrimary}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerButtonGradient}
              >
                <Text style={styles.headerButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Animated.View
              style={[
                styles.badgeContainer,
                {
                  opacity: badgeFadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.badge}>
                <Flame size={18} color="#2ECDA9" />
                <Text style={styles.badgeText}>Build habits that stick</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                {
                  opacity: titleFadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.heroTitle}>
                Keep your word.{'\n'}
                <Text style={styles.heroTitleAccent}>Build trust.</Text>
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                {
                  opacity: descriptionFadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.heroDescription}>
                The ultimate accountability tool for tracking commitments to yourself and others. Set goals, log progress, and grow your reputation.
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.heroButtons,
                {
                  opacity: buttonsFadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => onNavigate?.('signin')}
                style={styles.heroButtonPrimary}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroButtonGradient}
                >
                  <Text style={styles.heroButtonText}>Start Now</Text>
                  <ArrowRight size={20} color={theme.colors.primaryForeground} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>


        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresContent}>
            <View style={styles.featuresHeader}>
              <Text style={styles.featuresTitle}>
                Everything you need to stay committed
              </Text>
              <Text style={styles.featuresSubtitle}>
                Simple yet powerful tools to help you follow through on what matters most.
              </Text>
            </View>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => {
                const anim = featuresAnimations[index];
                const IconComponent = feature.icon;
                return (
                  <Animated.View
                    key={feature.title}
                    style={[
                      styles.featureCard,
                      {
                        opacity: anim.fade,
                        transform: [{ translateY: anim.slide }],
                      },
                    ]}
                  >
                    <View style={styles.featureIconContainer}>
                      <IconComponent size={24} color="#2ECDA9" />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Footer - hidden on desktop */}
        {Platform.OS !== 'web' && (
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.footerTop}>
                <View style={styles.footerLogo}>
                  <View style={styles.footerLogoIcon}>
                    <Crosshair size={20} color={theme.colors.primaryForeground} />
                  </View>
                  <Text style={styles.footerLogoText}>PromiseTracker</Text>
                </View>
                <Text style={styles.footerTagline}>
                  Keep your word. Build trust.
                </Text>
              </View>
              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => onNavigate?.('signin')}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate?.('signin')}>
                  <Text style={styles.footerLink}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate?.('promises')}>
                  <Text style={styles.footerLink}>Demo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerBottom}>
                <Text style={styles.footerText}>
                  © 2026 PromiseTracker. All rights reserved.
                </Text>
                <Text style={styles.footerSubtext}>
                  Keep your word. Build trust.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, insets: { top: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      paddingTop: Platform.OS === 'ios' ? Math.max(insets.top - 8, 0) : 0,
      backgroundColor: Platform.OS === 'web' 
        ? 'rgba(255, 255, 255, 0.85)' 
        : theme.colors.card,
      ...Platform.select({
        web: {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      }),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    headerContent: {
      maxWidth: 1152, // max-w-6xl equivalent
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: Platform.OS === 'web' ? theme.spacing[6] : theme.spacing[4],
      paddingVertical: Platform.OS === 'web' ? theme.spacing[4] : theme.spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing[2],
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      flexShrink: 1,
      minWidth: 0,
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      ...theme.typography.h2,
      fontSize: Platform.OS === 'web' ? theme.fontSizes.xl : theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
      flexShrink: 1,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      flexShrink: 0,
    },
    headerButton: {
      minWidth: Platform.OS === 'web' ? 80 : 0,
    },
    headerButtonPrimary: {
      borderRadius: 9999, // rounded-full
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          height: 48,
        },
        android: {
          height: 48,
        },
        web: {
          height: 48,
        },
      }),
    },
    headerButtonGradient: {
      paddingHorizontal: Platform.OS === 'web' ? theme.spacing[8] : theme.spacing[6],
      paddingVertical: Platform.OS === 'web' ? theme.spacing[3] : theme.spacing[2],
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          height: 48,
        },
        android: {
          height: 48,
        },
        web: {
          height: 48,
        },
      }),
    },
    headerButtonGhostText: {
      ...theme.typography.button,
      fontSize: 11,
      color: theme.colors.foreground,
      fontWeight: theme.fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    headerButtonText: {
      ...theme.typography.button,
      fontSize: 11,
      color: '#ffffff',
      fontWeight: theme.fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: (Platform.OS === 'ios' ? Math.max(insets.top - 8, 0) : 0) + (Platform.OS === 'web' ? 80 : 60), // Space for safe area + fixed header
    },
    heroSection: {
      paddingTop: theme.spacing[32],
      paddingBottom: theme.spacing[20],
      paddingHorizontal: theme.spacing[6],
    },
    heroContent: {
      maxWidth: 896, // max-w-4xl equivalent
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    },
    badgeContainer: {
      marginTop: theme.spacing[12],
      marginBottom: theme.spacing[12],
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingHorizontal: theme.spacing[4],
      paddingVertical: 6, // py-1.5 = 6px
      borderRadius: 9999,
      backgroundColor: 'rgba(20, 184, 166, 0.1)', // accent/10
    },
    badgeText: {
      ...theme.typography.bodySmall,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.semibold,
      color: '#2ECDA9',
      letterSpacing: 0.5, // tracking-wide
      textTransform: 'uppercase',
    },
    heroTitle: {
      ...theme.typography.h1Hero,
      fontSize: Platform.OS === 'web' ? 96 : 48, // text-6xl md:text-8xl
      fontWeight: theme.fontWeights.extraBold,
      textAlign: 'center',
      color: theme.colors.foreground,
      marginBottom: theme.spacing[8],
      lineHeight: Platform.OS === 'web' ? 86 : 52, // leading-[0.9]
      letterSpacing: -2,
    },
    heroTitleAccent: {
      color: theme.colors.accent,
    },
    heroDescription: {
      ...theme.typography.bodyLarge,
      fontSize: theme.fontSizes.xl,
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      maxWidth: 672, // max-w-2xl equivalent
      marginTop: theme.spacing[4] + 10, // 26px (16 + 10)
      marginBottom: theme.spacing[12] + 10, // 58px (48 + 10)
    },
    heroButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[4],
      width: '100%',
      marginBottom: theme.spacing[8],
    },
    heroButtonPrimary: {
      borderRadius: 9999, // Fully rounded
      overflow: 'hidden',
      height: 64, // h-16 = 64px
    },
    heroButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[3],
      paddingHorizontal: theme.spacing[10], // px-10 = 40px
      height: 64,
    },
    heroButtonText: {
      ...theme.typography.buttonLarge,
      fontSize: theme.fontSizes.lg,
      color: '#ffffff',
      fontWeight: theme.fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 2, // tracking-widest
    },
    featuresSection: {
      paddingVertical: theme.spacing[24],
      paddingHorizontal: theme.spacing[6],
    },
    featuresContent: {
      maxWidth: 1152,
      width: '100%',
      alignSelf: 'center',
    },
    featuresHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing[16],
    },
    featuresTitle: {
      ...theme.typography.h1,
      fontSize: Platform.OS === 'web' ? 36 : 30,
      fontWeight: theme.fontWeights.extraBold,
      textAlign: 'center',
      color: theme.colors.foreground,
      marginBottom: theme.spacing[4],
    },
    featuresSubtitle: {
      ...theme.typography.bodyLarge,
      fontSize: theme.fontSizes.lg,
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      maxWidth: 672,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[6],
      justifyContent: 'center',
    },
    featureCard: {
      flex: Platform.OS === 'web' ? 1 : 1,
      minWidth: Platform.OS === 'web' ? 250 : '100%',
      maxWidth: Platform.OS === 'web' ? 280 : '100%',
      padding: theme.spacing[8], // p-8 = 32px
      borderRadius: 24, // rounded-3xl = 24px
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        web: {
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
      }),
    },
    featureIconContainer: {
      width: 56, // w-14 = 56px
      height: 56, // h-14 = 56px
      borderRadius: theme.borderRadius.xl,
      backgroundColor: 'rgba(20, 184, 166, 0.1)', // accent/10
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[6],
    },
    featureTitle: {
      ...theme.typography.h2,
      fontSize: 24, // text-2xl = 24px
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: theme.colors.foreground,
      marginBottom: theme.spacing[4],
      letterSpacing: -0.5, // tracking-tight
    },
    featureDescription: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.base,
      color: '#64748b', // slate-500
      lineHeight: 24, // leading-relaxed
      fontWeight: theme.fontWeights.medium,
    },
    footer: {
      paddingVertical: theme.spacing[12],
      paddingHorizontal: theme.spacing[6],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    footerContent: {
      maxWidth: 1152,
      width: '100%',
      alignSelf: 'center',
      gap: theme.spacing[8],
    },
    footerTop: {
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    footerLogo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      marginBottom: theme.spacing[3],
    },
    footerLogoIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLogoText: {
      ...theme.typography.h2,
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
    },
    footerTagline: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.base,
      color: theme.colors.mutedForeground,
      fontStyle: 'italic',
    },
    footerLinks: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[6],
      paddingVertical: theme.spacing[4],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    footerLink: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.base,
      color: theme.colors.foreground,
      fontWeight: theme.fontWeights.medium,
    },
    footerBottom: {
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    footerText: {
      ...theme.typography.bodySmall,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
    },
    footerSubtext: {
      ...theme.typography.bodySmall,
      fontSize: theme.fontSizes.xs,
      color: theme.colors.mutedForeground,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });
