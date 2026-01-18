/**
 * Profile Screen
 * Identical to Promise-Tracker-1 Profile layout and design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Target,
  Flame,
  CheckCircle,
  BarChart3,
  Trophy,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Users,
  Shield,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { BottomNav } from '../components/BottomNav';
import { DesktopNav } from '../components/DesktopNav';
import { fontFamilies } from '../theme/typography';

interface ProfileProps {
  onNavigate?: (route: string) => void;
}

interface UserStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  streak: number;
}

const achievementIcons: Record<string, React.ElementType> = {
  target: Target,
  flame: Flame,
  'check-circle': CheckCircle,
  users: Users,
};

export default function Profile({ onNavigate }: ProfileProps) {
  const { theme } = useTheme();
  const { isMobileView } = useIsMobileView();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    completed: 0,
    active: 0,
    overdue: 0,
    streak: 0,
  });
  const [promises, setPromises] = useState<any[]>([]);

  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
  };

  const styles = createStyles(theme, safeInsets);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.request<{ promises: any[] }>('/promises', {
        method: 'GET',
      });

      const promisesData = response.promises || [];
      setPromises(promisesData);
      
      const completedPromises = promisesData.filter((p) => p.status === 'completed');
      const calculatedStreak = completedPromises.length > 0 ? 1 : 0; // TODO: Calculate actual streak

      const userStats: UserStats = {
        total: promisesData.length,
        completed: completedPromises.length,
        active: promisesData.filter((p) => p.status === 'ongoing').length,
        overdue: promisesData.filter((p) => p.status === 'overdue').length,
        streak: calculatedStreak,
      };

      setStats(userStats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (!confirmed) return;
      (async () => {
        try {
          await logout();
          onNavigate?.('signin');
        } catch (error) {
          console.error('Logout error:', error);
          window.alert('Failed to log out. Please try again.');
        }
      })();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onNavigate?.('signin');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]);
    }
  };

  const getUserInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  };

  const reputationScore = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Mock achievements - in real app, these would come from backend
  const achievements = [
    {
      id: '1',
      icon: 'target',
      title: 'First Promise',
      description: 'Made your first promise',
    },
    {
      id: '2',
      icon: 'flame',
      title: 'Week Warrior',
      description: '7-day streak',
    },
    {
      id: '3',
      icon: 'check-circle',
      title: 'Reliable',
      description: 'Completed 5 promises',
    },
    {
      id: '4',
      icon: 'users',
      title: 'Social Butterfly',
      description: 'Made 3 social promises',
    },
  ];

  // Mock recent activity - in real app, this would come from backend
  const formatActivityAction = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Completed milestone';
      case 'created':
        return 'Created promise';
      default:
        return 'Created promise';
    }
  };

  const recentActivity = [
    ...promises.slice(0, 5).map((promise) => ({
      id: promise.id,
      action: formatActivityAction(promise.status === 'completed' ? 'completed' : 'created'),
      promise: promise.title,
      time: formatRelativeTime(promise.updated_at || promise.created_at),
    })),
    // Test items
    {
      id: 'test-1',
      action: 'Completed milestone',
      promise: 'Complete React Course',
      time: '2 hours ago',
    },
    {
      id: 'test-2',
      action: 'Added check-in',
      promise: 'Read 2 books this month',
      time: '5 hours ago',
    },
    {
      id: 'test-3',
      action: 'Created promise',
      promise: 'Team project delivery',
      time: '1 day ago',
    },
    {
      id: 'test-4',
      action: 'Completed milestone',
      promise: 'Morning Workout Routine',
      time: '2 days ago',
    },
    {
      id: 'test-5',
      action: 'Earned achievement',
      promise: 'Week Warrior',
      time: '3 days ago',
    },
  ].slice(0, 10);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => onNavigate?.('promises')}
            >
              <ArrowLeft size={20} color={theme.colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PROFILE</Text>
          </View>
          <DesktopNav currentRoute="/profile" onNavigate={onNavigate || (() => {})} />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              // TODO: Navigate to settings
            }}
          >
            <Settings size={20} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Container with 2-column layout */}
        <View style={styles.contentContainer}>
          {/* Left Column: User Info + Reputation */}
          <View style={styles.leftColumn}>
            {/* User Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user ? getUserInitials(user.name) : 'U'}
                  </Text>
                </View>
                <View style={styles.avatarBadge}>
                  <Shield size={12} color="#ffffff" />
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{(user?.email || '').toUpperCase()}</Text>
              </View>
            </View>

            {/* Reputation Card */}
            <View style={styles.reputationCard}>
              <View style={styles.reputationHeader}>
                <Text style={styles.reputationValue}>{reputationScore}</Text>
                <Text style={styles.reputationLabel}>REPUTATION</Text>
              </View>
              <View style={styles.reputationStats}>
                <View style={styles.reputationStatItem}>
                  <Text style={styles.reputationStatValue}>{stats.streak}D</Text>
                  <Text style={styles.reputationStatLabel}>STREAK</Text>
                </View>
                <View style={styles.reputationStatItem}>
                  <Text style={[styles.reputationStatValue, styles.reputationStatValueAccent]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.reputationStatLabel}>KEPT</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Achievements + Activity */}
          <View style={styles.rightColumn}>
            {/* Achievements */}
            <View style={styles.achievementsCard}>
              <View style={styles.sectionHeader}>
                <Trophy size={20} color={theme.colors.mutedForeground} />
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => {
                  const Icon = achievementIcons[achievement.icon] || Trophy;
                  return (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <View style={styles.achievementIconContainer}>
                        <Icon size={16} color={theme.colors.accent} />
                      </View>
                      <View style={styles.achievementTextContainer}>
                        <Text style={styles.achievementTitle} numberOfLines={1}>
                          {achievement.title.toUpperCase()}
                        </Text>
                        <Text style={styles.achievementDescription} numberOfLines={1}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Activity */}
            <View style={styles.activityCard}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={theme.colors.mutedForeground} />
                <Text style={styles.sectionTitle}>Activity</Text>
              </View>
              <View style={styles.activityList}>
                {recentActivity.map((activity) => (
                  <View key={activity.id} style={styles.activityItemCard}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityPromise} numberOfLines={1}>
                        {activity.promise}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {activity.action} • {activity.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.logoutButtonContent}>
                <View style={styles.logoutButtonLeft}>
                  <LogOut size={20} color={theme.colors.destructive} />
                  <Text style={styles.logoutButtonText}>LOG OUT</Text>
                </View>
                <ChevronRight size={16} color={theme.colors.destructive} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {isMobileView && (
        <BottomNav currentRoute="/profile" onNavigate={onNavigate || (() => {})} />
      )}
    </View>
  );
}

const createStyles = (theme: any, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Math.max((insets?.top ?? 0) - 5, 0), // 5px smaller top gap
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...Platform.select({
        web: {
          position: 'sticky' as any,
          top: 0,
          zIndex: 50,
          backgroundColor: theme.colors.background,
        },
      }),
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      maxWidth: 1152, // max-w-6xl equivalent (same as contentContainer)
      width: '100%',
      alignSelf: 'center',
      gap: theme.spacing[4],
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.medium,
    },
    headerTitle: {
      fontSize: theme.fontSizes.lg + 3, // 18 + 3 = 21
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontFamily: fontFamilies.display,
    },
    settingsButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.medium,
    },
    profileHeader: {
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
    },
    avatarContainer: {
      position: 'relative',
      alignSelf: 'flex-start',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: '#0f172a', // slate-900 (dark)
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 35, // 32 + 3
      fontWeight: theme.fontWeights.bold,
      color: '#ffffff',
      fontFamily: fontFamilies.display,
    },
    avatarBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    profileInfo: {
      gap: theme.spacing[1],
    },
    userName: {
      fontSize: 27, // 24 + 3
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
      fontFamily: fontFamilies.display,
    },
    userEmail: {
      fontSize: theme.fontSizes.sm + 3, // 14 + 3 = 17
      color: theme.colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: fontFamilies.sans,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing[16] + (insets?.bottom ?? 0),
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[6],
    },
    contentContainer: {
      maxWidth: 1152, // max-w-6xl equivalent
      width: '100%',
      alignSelf: 'center',
      ...Platform.select({
        web: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing[6],
        },
      }),
    },
    leftColumn: {
      gap: theme.spacing[6],
      ...Platform.select({
        web: {
          width: 400,
          flexShrink: 0,
        },
      }),
    },
    rightColumn: {
      gap: theme.spacing[6],
      ...Platform.select({
        web: {
          flex: 1,
          minWidth: 0,
        },
      }),
    },
    reputationCard: {
      padding: theme.spacing[5],
      borderRadius: 24, // rounded-[1.5rem]
      backgroundColor: '#0f172a', // slate-900 (dark theme)
      gap: theme.spacing[4],
      ...Platform.select({
        web: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    reputationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing[2],
    },
    reputationValue: {
      fontSize: 51, // 48 + 3
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: '#ffffff',
      letterSpacing: -1,
    },
    reputationLabel: {
      fontSize: 11, // 8 + 3
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 4,
      fontFamily: fontFamilies.sans,
    },
    reputationStats: {
      flexDirection: 'row',
      gap: theme.spacing[4],
      paddingTop: theme.spacing[4],
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    reputationStatItem: {
      flex: 1,
      gap: theme.spacing[1],
    },
    reputationStatValue: {
      fontSize: 21, // 18 + 3
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: '#fb923c', // orange-400 (for streak)
    },
    reputationStatValueAccent: {
      color: theme.colors.accent, // teal (for kept)
    },
    reputationStatLabel: {
      fontSize: 10, // 7 + 3
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      fontFamily: fontFamilies.sans,
    },
    achievementsCard: {
      padding: theme.spacing[5],
      ...Platform.select({
        web: {
          width: '100%',
        },
      }),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      marginBottom: theme.spacing[4],
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg + 3, // 18 + 3 = 21
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.foreground,
      fontFamily: fontFamilies.display,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[3],
    },
    achievementItem: {
      flex: 1,
      minWidth: '45%',
      padding: theme.spacing[3],
      borderRadius: 20, // rounded pill
      backgroundColor: '#ffffff', // white
      borderWidth: 1,
      borderColor: '#d1d5db', // light grey
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    achievementIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(20, 184, 166, 0.1)', // teal-500/10
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    achievementTextContainer: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    achievementTitle: {
      fontSize: 13, // 10 + 3
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: fontFamilies.sans,
    },
    achievementDescription: {
      fontSize: 12, // 9 + 3
      color: theme.colors.mutedForeground,
      fontFamily: fontFamilies.sans,
    },
    activityCard: {
      padding: theme.spacing[5],
      ...Platform.select({
        web: {
          width: '100%',
        },
      }),
    },
    activityList: {
      gap: theme.spacing[3],
    },
    activityItemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.lg,
      backgroundColor: '#ffffff', // white
      borderWidth: 1,
      borderColor: '#d1d5db', // light grey
    },
    activityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
      flexShrink: 0,
    },
    activityContent: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    activityPromise: {
      fontSize: theme.fontSizes.sm + 3, // 14 + 3 = 17
      fontWeight: theme.fontWeights.medium,
      color: theme.colors.foreground,
      fontFamily: fontFamilies.sans,
    },
    activityMeta: {
      fontSize: 13, // 10 + 3
      lineHeight: 18, // 15 + 3
      fontWeight: '700',
      fontFamily: fontFamilies.sans,
      color: '#90A1B9',
    },
    logoutButton: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.destructive,
      marginTop: theme.spacing[6],
      marginBottom: theme.spacing[4],
      alignSelf: 'flex-end',
    },
    logoutButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoutButtonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    logoutButtonText: {
      fontSize: theme.fontSizes.sm + 3, // 14 + 3 = 17
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.destructive,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontFamily: fontFamilies.sans,
    },
  });
