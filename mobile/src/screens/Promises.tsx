/**
 * Promises Dashboard Screen
 * Converted from Promise-Tracker-1 Dashboard.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../theme/ThemeProvider';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Target,
  Flame,
  BarChart3,
  CheckCircle,
  Clock,
  MinusCircle,
  Users,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Check,
  Bell,
  Shield,
  Crosshair,
  X,
} from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAchievements } from '../contexts/AchievementContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { fontFamilies } from '../theme/typography';
import { BottomNav } from '../components/BottomNav';

interface Promise {
  id: string;
  user_id: string;
  promisee_id?: string | null;
  mentor_id?: string | null;
  title: string;
  description?: string | null;
  deadline?: string | null;
  status: 'ongoing' | 'completed' | 'overdue' | 'declined' | 'not_made';
  created_at: string;
  updated_at: string;
  promisee?: { id: string; name: string; email: string };
  mentor?: { id: string; name: string; email: string };
  milestone_count?: number;
  completed_milestones?: number;
}

interface PromisesProps {
  onNavigate?: (route: string) => void;
}

function PromiseCard({
  promise,
  onDelete,
  onMarkAsNotMade,
  currentUserId,
  theme,
  onNavigate,
}: {
  promise: Promise;
  onDelete: (id: string) => void;
  onMarkAsNotMade?: (id: string) => void;
  currentUserId?: string;
  theme: any;
  onNavigate?: (route: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { isDesktopView } = useIsMobileView();
  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
  };
  const styles = createStyles(theme, safeInsets, isDesktopView);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const moreButtonRef = useRef<View>(null);
  const { showToast } = useToast();

  const daysLeft = promise.deadline 
    ? Math.ceil((new Date(promise.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const completedMilestones = promise.completed_milestones || 0;
  const totalMilestones = promise.milestone_count || 0;
  const progress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : promise.status === 'completed' ? 100 : 0;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleComplete = () => {
    setMenuVisible(false);
    showToast('Promise completed! Great job keeping your word!', 'success');
  };

  const handleEdit = () => {
    setMenuVisible(false);
    // TODO: Navigate to edit screen
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete(promise.id);
  };

  const handleMarkAsNotMade = () => {
    setMenuVisible(false);
    onMarkAsNotMade?.(promise.id);
  };

  const handleMoreButtonPress = () => {
    setMenuVisible(true);
  };

  const isSocial = promise.promisee_id && promise.promisee_id !== promise.user_id;

  // Your role: from me (owner), to me (promisee), or mentoring
  const role =
    currentUserId === promise.user_id
      ? ('from_me' as const)
      : currentUserId === promise.promisee_id
        ? ('to_me' as const)
        : currentUserId === promise.mentor_id
          ? ('mentoring' as const)
          : null;

  return (
    <TouchableOpacity
      style={[
        styles.promiseCard,
        isHovered && promise.status !== 'not_made' && styles.promiseCardHovered,
        isHovered && promise.status === 'not_made' && styles.promiseCardNotMadeHovered,
        promise.status === 'completed' && styles.promiseCardCompleted,
        promise.status === 'not_made' && styles.promiseCardNotMade,
      ]}
      onPress={() => onNavigate?.(`promise/${promise.id}`)}
      activeOpacity={0.95}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } : {})}
    >
      {/* Header */}
      <View style={styles.promiseCardHeader}>
        <View style={styles.promiseCardHeaderLeft}>
          {/* Badges */}
          <View style={styles.promiseCardBadges}>
            {role === 'from_me' && (
              <View style={[styles.roleBadge, styles.roleBadgeFromMe]}>
                <Text style={styles.roleBadgeTextFromMe}>From me</Text>
              </View>
            )}
            {role === 'to_me' && (
              <View style={[styles.roleBadge, styles.roleBadgeToMe]}>
                <Text style={styles.roleBadgeTextToMe}>To me</Text>
              </View>
            )}
            {role === 'mentoring' && (
              <View style={[styles.roleBadge, styles.roleBadgeMentoring]}>
                <Text style={styles.roleBadgeTextMentoring}>Mentoring</Text>
              </View>
            )}
            {isSocial && (
              <View style={styles.socialBadge}>
                <Text style={styles.socialBadgeText}>Social</Text>
              </View>
            )}
            {daysLeft !== null && promise.status !== 'completed' && promise.status !== 'not_made' && (
              <View style={[styles.daysLeftBadge, daysLeft <= 3 && styles.daysLeftBadgeUrgent]}>
                <Text style={[styles.daysLeftText, daysLeft <= 3 && styles.daysLeftTextUrgent]}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                </Text>
              </View>
            )}
          </View>
          {/* Title */}
          <Text style={[styles.promiseTitle, isHovered && styles.promiseTitleHovered]}>{promise.title}</Text>
        </View>
        {/* More Button - hidden for completed and not_made (no modifying) */}
        {isHovered && promise.status !== 'completed' && promise.status !== 'not_made' && (
          <View
            ref={moreButtonRef}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              if (Platform.OS === 'web') {
                const element = (moreButtonRef.current as any);
                if (element) {
                  const domNode = element;
                  if (domNode && typeof domNode.getBoundingClientRect === 'function') {
                    const rect = domNode.getBoundingClientRect();
                    setMenuPosition({ x: rect.left + rect.width / 2, y: rect.bottom });
                  } else {
                    setMenuPosition({ x: x + width / 2, y: y + height });
                  }
                }
              } else {
                moreButtonRef.current?.measure((fx, fy, fwidth, fheight, pageX, pageY) => {
                  setMenuPosition({ x: pageX + fwidth / 2, y: pageY + fheight });
                });
              }
            }}
          >
            <TouchableOpacity
              onPress={handleMoreButtonPress}
              style={styles.moreButton}
              activeOpacity={0.7}
            >
              <MoreHorizontal size={16} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.promiseProgressContainer}>
        {promise.status === 'completed' ? (
          <Text style={styles.promiseCompletedText}>Completed</Text>
        ) : promise.status === 'not_made' ? (
          <Text style={styles.promiseNotMadeText}>Not made</Text>
        ) : (
          <>
            <View style={styles.promiseProgressInfo}>
              <Text style={styles.promiseProgressText}>Progress</Text>
              <Text style={styles.promiseProgressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]}>
                <LinearGradient
                  colors={['#14b8a6', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarGradient}
                />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Footer - no deadline/days for completed or not_made */}
      <View style={styles.promiseCardFooter}>
        <View style={styles.promiseCardFooterLeft}>
          {promise.status === 'completed' ? (
            <>
              <CheckCircle size={14} color={theme.colors.mutedForeground} />
              <Text style={styles.promiseCardFooterText}>Completed</Text>
            </>
          ) : promise.status === 'not_made' ? (
            <>
              <MinusCircle size={14} color={theme.colors.destructive} />
              <Text style={[styles.promiseCardFooterText, { color: theme.colors.destructive }]}>Not made</Text>
            </>
          ) : (
            <>
              <Clock size={14} color={theme.colors.mutedForeground} />
              <Text style={styles.promiseCardFooterText}>
                {promise.deadline ? formatDate(promise.deadline) : 'No deadline'}
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onNavigate?.(`promise/${promise.id}`)}
          style={styles.viewButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewButtonText, promise.status === 'not_made' && { color: theme.colors.destructive }]}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[
            styles.menuContent,
            Platform.OS === 'web' && {
              position: 'absolute',
              left: menuPosition.x - 100,
              top: menuPosition.y + 10,
            }
          ]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleComplete}
            >
              <Check size={16} color={theme.colors.foreground} />
              <Text style={styles.menuItemText}>Mark Complete</Text>
            </TouchableOpacity>
            {onMarkAsNotMade && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleMarkAsNotMade}
              >
                <MinusCircle size={16} color={theme.colors.mutedForeground} />
                <Text style={styles.menuItemText}>Mark as Not Made</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEdit}
            >
              <Pencil size={16} color={theme.colors.foreground} />
              <Text style={styles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDestructive]}
              onPress={handleDelete}
            >
              <Trash2 size={16} color={theme.colors.destructive} />
              <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

export default function Promises({ onNavigate }: PromisesProps) {
  const { theme } = useTheme();
  const { isMobileView, isDesktopView } = useIsMobileView();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { checkAndUnlockAchievement } = useAchievements();
  const insets = useSafeAreaInsets();
  const [promises, setPromises] = useState<Promise[]>([]);
  const [filter, setFilter] = useState<'all' | 'personal' | 'social'>('all');
  const [loading, setLoading] = useState(true);
  const [dismissedReliabilityCard, setDismissedReliabilityCard] = useState(false);
  const [dismissedMomentumCard, setDismissedMomentumCard] = useState(false);

  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
  };

  const styles = createStyles(theme, safeInsets, isDesktopView);

  useEffect(() => {
    loadPromises();
  }, []);

  const loadPromises = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/promises', {
        method: 'GET',
      }) as { promises?: Promise[] };
      const promisesList = response.promises || [];
      setPromises(promisesList);
      
      // Check for count-based achievements
      const totalCount = promisesList.length;
      const completedCount = promisesList.filter(p => p.status === 'completed').length;
      const socialCompletedCount = promisesList.filter(
        p => p.status === 'completed' && p.promisee_id && p.promisee_id !== p.user_id
      ).length;
      
      // Promise creation achievements
      if (totalCount >= 5) await checkAndUnlockAchievement('five_promises');
      if (totalCount >= 10) await checkAndUnlockAchievement('ten_promises');
      if (totalCount >= 25) await checkAndUnlockAchievement('twenty_five_promises');
      
      // Promise completion achievements
      if (completedCount >= 5) await checkAndUnlockAchievement('five_completed');
      if (completedCount >= 10) await checkAndUnlockAchievement('ten_completed');
      
      // Social completion achievements
      if (socialCompletedCount >= 5) await checkAndUnlockAchievement('five_social_completed');
    } catch (error) {
      console.error('Failed to load promises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPromises = promises.filter((p) => {
    if (filter === 'personal') {
      return !p.promisee_id || p.promisee_id === p.user_id;
    }
    if (filter === 'social') {
      return p.promisee_id && p.promisee_id !== p.user_id;
    }
    return true;
  });

  // Order: 1) Overdue, 2) Ongoing, 3) Completed, 4) Not made/Failed (declined). Within each: by date.
  const getGroupOrder = (p: Promise): number => {
    if (p.status === 'overdue') return 1;
    if (p.status === 'ongoing' && p.deadline && new Date(p.deadline).getTime() < Date.now()) return 1;
    if (p.status === 'ongoing') return 2;
    if (p.status === 'completed') return 3;
    if (p.status === 'declined' || p.status === 'not_made') return 4; // fail: not made / declined
    return 5;
  };

  const sortedPromises = [...filteredPromises].sort((a, b) => {
    const ga = getGroupOrder(a);
    const gb = getGroupOrder(b);
    if (ga !== gb) return ga - gb;
    const g = ga;
    if (g === 1 || g === 2) {
      const da = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
      const db = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
      return da - db; // ascending: soonest (or most overdue) first
    }
    // g 3 or 4: by updated_at desc
    const ua = new Date(a.updated_at || a.created_at || 0).getTime();
    const ub = new Date(b.updated_at || b.created_at || 0).getTime();
    return ub - ua;
  });

  // Separate rows: active (overdue+ongoing), then completed, then fail (not_made+declined)
  const activeList = sortedPromises.filter((p) => getGroupOrder(p) <= 2);
  const completedList = sortedPromises.filter((p) => getGroupOrder(p) === 3);
  const failList = sortedPromises.filter((p) => getGroupOrder(p) === 4);

  const activePromises = promises.filter((p) => p.status === 'ongoing');
  const completedPromises = promises.filter((p) => p.status === 'completed');
  const totalPromises = promises.length;
  const currentStreak = completedPromises.length > 0 ? 1 : 0; // TODO: Calculate actual streak
  const completionRate = totalPromises > 0 
    ? Math.round((completedPromises.length / totalPromises) * 100) 
    : 0;

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = (id: string) => {
    setPromises(promises.filter((p) => p.id !== id));
  };

  const handleMarkAsNotMade = async (id: string) => {
    try {
      await apiService.request(`/promises/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'not_made' }),
      });
      showToast('Marked as not made.', 'success');
      loadPromises();
    } catch (e: any) {
      showToast(e?.error || 'Failed to update promise', 'error');
    }
  };

  const handleTestNotification = async () => {
    try {
      // Request permissions first
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast('Notification permissions not granted', 'error');
        return;
      }

      // Schedule a local notification after 5 seconds
      const fiveSecondsFromNow = new Date(Date.now() + 5000);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from Promise Tracker!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: 'date',
          date: fiveSecondsFromNow,
        } as any, // Type assertion - runtime format is correct
      });

      showToast('Notification will appear in 5 seconds. Minimize the app to see it!', 'success');
    } catch (error) {
      console.error('Failed to send notification:', error);
      showToast('Failed to send notification', 'error');
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>PT</Text>
              </View>
              {isDesktopView && (
                <Text style={styles.logoTextFull}>PromiseTracker</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => onNavigate?.('create')}
              style={styles.newPromiseButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0f172a', '#1e293b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newPromiseButtonGradient}
              >
                <Text style={styles.newPromiseButtonText}>New Promise</Text>
              </LinearGradient>
            </TouchableOpacity>
            <ThemeToggle />
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => onNavigate?.('profile')}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user ? getUserInitials(user.name) : 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stats Block - Top Section (matches web sidebar) */}
        <View style={styles.statsBlock}>
          {/* Reliability Card */}
          {(isDesktopView || !dismissedReliabilityCard) && (
            <View style={styles.reliabilityCard}>
              <View style={styles.reliabilityCardContent}>
                <View style={styles.reliabilityHeader}>
                  <View style={styles.reliabilityIconContainer}>
                    <Shield size={16} color={theme.colors.accent} />
                  </View>
                  <View style={styles.reliabilityHeaderRight}>
                    <Text style={styles.reliabilityLabel}>Reliability</Text>
                    <Text style={styles.reliabilityValue}>{completionRate}%</Text>
                  </View>
                  {isMobileView && (
                    <TouchableOpacity
                      style={styles.cardDismissButton}
                      onPress={() => setDismissedReliabilityCard(true)}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                  )}
                </View>

              <View style={styles.reliabilityStats}>
                {/* Ending Soon */}
                <View style={styles.endingSoonCard}>
                  <View style={styles.endingSoonHeader}>
                    <View style={styles.endingSoonLeft}>
                      <Clock size={12} color="#f97316" />
                      <Text style={styles.endingSoonLabel}>Ending Soon</Text>
                    </View>
                    <Text style={styles.endingSoonCount}>
                      {promises.filter(p => {
                        if (!p.deadline) return false;
                        const days = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return days <= 3 && days > 0 && p.status === 'ongoing';
                      }).length} Due
                    </Text>
                  </View>
                  <View style={styles.endingSoonProgressBar}>
                    <View style={[styles.endingSoonProgressFill, { 
                      width: `${Math.min(100, (promises.filter(p => {
                        if (!p.deadline) return false;
                        const days = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return days <= 3 && days > 0 && p.status === 'ongoing';
                      }).length / Math.max(1, activePromises.length)) * 100)}%` 
                    }]} />
                  </View>
                </View>

                {/* Active and Kept Stats */}
                <View style={styles.activeKeptGrid}>
                  <View style={styles.activeKeptCard}>
                    <Text style={styles.activeKeptValue}>{activePromises.length}</Text>
                    <Text style={styles.activeKeptLabel}>Active</Text>
                  </View>
                  <View style={styles.activeKeptCard}>
                    <Text style={[styles.activeKeptValue, styles.activeKeptValueAccent]}>
                      {completedPromises.length}
                    </Text>
                    <Text style={styles.activeKeptLabel}>Kept</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          )}

          {/* Momentum Card */}
          {(isDesktopView || !dismissedMomentumCard) && (
            <View style={styles.momentumCard}>
              <View style={styles.momentumContent}>
                <View style={styles.momentumHeader}>
                  <View style={styles.momentumIconContainer}>
                    <Flame size={14} color="#fb923c" />
                  </View>
                  <View style={styles.momentumHeaderText}>
                    <Text style={styles.momentumValue}>{currentStreak} Days</Text>
                    <Text style={styles.momentumLabel}>Momentum</Text>
                  </View>
                  {isMobileView && (
                    <TouchableOpacity
                      style={styles.cardDismissButton}
                      onPress={() => setDismissedMomentumCard(true)}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.momentumNote}>
                  <Text style={styles.momentumNoteText}>
                    {completionRate}% success rate this week.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Active Promises Section */}
          <View style={styles.activePromisesHeader}>
            {isMobileView && (
              <Text style={styles.activePromisesTitle}>Active Promises</Text>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={[styles.tab, filter === 'all' && styles.tabActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, filter === 'personal' && styles.tabActive]}
              onPress={() => setFilter('personal')}
            >
              <Text style={[styles.tabText, filter === 'personal' && styles.tabTextActive]}>Personal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, filter === 'social' && styles.tabActive]}
              onPress={() => setFilter('social')}
            >
              <Text style={[styles.tabText, filter === 'social' && styles.tabTextActive]}>Social</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promises List - active, completed, fail in separate rows */}
        {sortedPromises.length > 0 ? (
          <>
            {activeList.length > 0 && (
              <View style={styles.promisesList}>
                {activeList.map((promise) => (
                  <PromiseCard
                    key={promise.id}
                    promise={promise}
                    onDelete={handleDelete}
                    onMarkAsNotMade={promise.user_id === user?.id ? handleMarkAsNotMade : undefined}
                    currentUserId={user?.id}
                    theme={theme}
                    onNavigate={onNavigate}
                  />
                ))}
              </View>
            )}
            {completedList.length > 0 && (
              <View style={[styles.promisesList, styles.promisesListSectionAfter]}>
                {completedList.map((promise) => (
                  <PromiseCard
                    key={promise.id}
                    promise={promise}
                    onDelete={handleDelete}
                    onMarkAsNotMade={promise.user_id === user?.id ? handleMarkAsNotMade : undefined}
                    currentUserId={user?.id}
                    theme={theme}
                    onNavigate={onNavigate}
                  />
                ))}
              </View>
            )}
            {failList.length > 0 && (
              <View style={[styles.promisesList, styles.promisesListSectionAfter]}>
                {failList.map((promise) => (
                  <PromiseCard
                    key={promise.id}
                    promise={promise}
                    onDelete={handleDelete}
                    onMarkAsNotMade={promise.user_id === user?.id ? handleMarkAsNotMade : undefined}
                    currentUserId={user?.id}
                    theme={theme}
                    onNavigate={onNavigate}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Target size={32} color={theme.colors.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>No promises yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first promise to start building trust.
            </Text>
            <TouchableOpacity
              onPress={() => onNavigate?.('create')}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Create Promise</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>

      {isMobileView && (
        <BottomNav currentRoute="/promises" onNavigate={onNavigate || (() => {})} />
      )}
    </View>
  );
}

const createStyles = (theme: any, insets: { top: number; bottom: number }, isDesktopView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Math.max((insets?.top ?? 0) - 5, 0), // 5px smaller top gap
      paddingBottom: isDesktopView ? (insets?.bottom ?? 0) : (insets?.bottom ?? 0) + 60, // No extra gap for bottom nav on desktop
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      backgroundColor: isDesktopView 
        ? (theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)')
        : theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...(Platform.OS === 'web' ? {} : { paddingTop: 0 }),
      ...Platform.select({
        web: {
          position: 'sticky' as any,
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      }),
    },
    headerContent: {
      maxWidth: 1152, // max-w-6xl equivalent
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.mode === 'dark' ? theme.colors.accent : '#0f172a',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      ...theme.typography.button,
      fontSize: theme.fontSizes.sm,
      color: '#ffffff',
      fontWeight: theme.fontWeights.bold,
    },
    logoTextFull: {
      ...theme.typography.h2,
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: theme.colors.foreground,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
    },
    newPromiseButton: {
      borderRadius: 9999, // rounded-full
      overflow: 'hidden',
      height: 40,
    },
    newPromiseButtonGradient: {
      paddingHorizontal: theme.spacing[6],
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    newPromiseButtonText: {
      ...theme.typography.button,
      fontSize: 11,
      color: '#ffffff',
      fontWeight: theme.fontWeights.bold,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    avatarButton: {
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    avatar: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.button,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.primaryForeground,
      fontWeight: theme.fontWeights.semibold,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      maxWidth: 1152, // max-w-6xl equivalent
      width: '100%',
      alignSelf: 'center',
      padding: theme.spacing[4],
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[4],
      ...(isDesktopView ? {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: theme.spacing[6],
      } : {}),
    },
    statsBlock: {
      gap: theme.spacing[4],
      marginBottom: theme.spacing[8],
      flexDirection: isDesktopView ? 'column' : 'row',
      alignItems: 'flex-start',
      ...(isDesktopView ? {
        width: 230,
        marginBottom: 0,
        marginTop: 25,
        height: '100%',
      } : {}),
    },
    reliabilityCard: {
      borderRadius: 24, // rounded-[1.5rem]
      backgroundColor: '#0f172a', // slate-900 (dark like momentumCard)
      borderWidth: 0, // Remove border for dark card
      ...Platform.select({
        web: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
          width: '100%',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          flex: 1,
        },
      }),
    },
    reliabilityCardContent: {
      padding: 14, // p-3.5 = 14px
      gap: theme.spacing[3],
    },
    reliabilityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
    },
    reliabilityIconContainer: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Match momentumCard icon container
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      }),
    },
    reliabilityHeaderRight: {
      alignItems: 'flex-end',
      flex: 1,
    },
    reliabilityLabel: {
      fontSize: 8,
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.4)', // Match momentumLabel
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    reliabilityValue: {
      fontSize: 20,
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: '#ffffff', // White for dark background
      letterSpacing: -0.5,
    },
    reliabilityStats: {
      gap: 10, // space-y-2.5 = 10px
    },
    endingSoonCard: {
      padding: 10, // p-2.5 = 10px
      borderRadius: 16, // rounded-2xl = 16px
      backgroundColor: 'rgba(255, 255, 255, 0.05)', // Dark card background
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)', // Dark border
    },
    endingSoonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    endingSoonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6, // gap-1.5 = 6px
    },
    endingSoonLabel: {
      fontSize: 9,
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.6)', // Light text for dark background
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    endingSoonCount: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: '#ffffff', // White for dark background
    },
    endingSoonProgressBar: {
      height: 4,
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light background for dark card
      overflow: 'hidden',
    },
    endingSoonProgressFill: {
      height: '100%',
      backgroundColor: '#f97316', // orange-500
      borderRadius: theme.borderRadius.full,
    },
    activeKeptGrid: {
      flexDirection: 'row',
      gap: 10, // gap-2.5 = 10px
    },
    activeKeptCard: {
      flex: 1,
      padding: 10, // p-2.5 = 10px
      borderRadius: 16, // rounded-2xl = 16px
      backgroundColor: 'rgba(255, 255, 255, 0.05)', // Dark card background
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)', // Dark border
      alignItems: 'center',
    },
    activeKeptValue: {
      fontSize: 18,
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: '#ffffff', // White for dark background
    },
    activeKeptValueAccent: {
      color: theme.colors.accent,
    },
    activeKeptLabel: {
      fontSize: 7,
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.4)', // Match momentumLabel
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginTop: 2,
    },
    momentumCard: {
      borderRadius: 24, // rounded-[1.5rem]
      backgroundColor: '#0f172a', // slate-900
      padding: theme.spacing[5],
      ...Platform.select({
        web: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
          width: '100%',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          flex: 1,
        },
      }),
    },
    momentumContent: {
      gap: theme.spacing[3],
    },
    momentumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10, // gap-2.5 = 10px
      position: 'relative',
    },
    momentumHeaderText: {
      flex: 1,
    },
    momentumIconContainer: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    momentumValue: {
      fontSize: 14,
      fontWeight: theme.fontWeights.bold,
      fontFamily: fontFamilies.display,
      color: '#ffffff',
    },
    momentumLabel: {
      fontSize: 7,
      fontWeight: theme.fontWeights.bold,
      color: 'rgba(255, 255, 255, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginTop: 4,
    },
    cardDismissButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    momentumNote: {
      padding: 10, // p-2.5 = 10px
      borderRadius: 12, // rounded-xl = 12px
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    momentumNoteText: {
      fontSize: 9,
      color: '#94a3b8', // slate-400
      fontWeight: theme.fontWeights.medium,
    },
    mainContent: {
      ...Platform.select({
        web: {
          flex: 1,
          minWidth: 0,
        },
      }),
    },
    activePromisesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    activePromisesTitle: {
      ...theme.typography.h2,
      fontSize: 30, // text-3xl = 30px
      fontFamily: fontFamilies.display, // font-display
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
      letterSpacing: -0.5,
    },
    tabsContainer: {
      marginBottom: theme.spacing[2],
      width: '100%',
      paddingHorizontal: theme.spacing[4], // Increased padding
      ...Platform.select({
        web: {
          marginBottom: theme.spacing[1],
        },
      }),
    },
    tabsList: {
      flexDirection: 'row',
      backgroundColor: theme.colors.muted,
      borderRadius: 12, // rounded-xl = 12px (reduced from 20)
      padding: 8, // 8px padding
      marginVertical: theme.spacing[2], // Add vertical margin
      gap: 8, // Gap between tabs
      ...Platform.select({
        web: {
          alignSelf: 'flex-start',
          padding: 8,
          marginVertical: theme.spacing[2],
        },
        default: {
          width: '100%',
        },
      }),
    },
    tab: {
      paddingVertical: 0,
      borderRadius: 8, // rounded-lg = 8px (reduced from 12)
      alignItems: 'center',
      justifyContent: 'center',
      height: 25, // 25px height
      ...Platform.select({
        web: {
          paddingHorizontal: theme.spacing[2], // spacing[2]
          height: 25,
        },
        default: {
          flex: 1,
        },
      }),
    },
    tabActive: {
      backgroundColor: theme.colors.card,
      ...Platform.select({
        web: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      }),
    },
    tabText: {
      ...theme.typography.button,
      fontSize: 11,
      color: theme.colors.mutedForeground,
      fontWeight: theme.fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      lineHeight: undefined,
      ...Platform.select({
        web: {
          fontSize: 10,
          lineHeight: undefined,
        },
      }),
    },
    tabTextActive: {
      color: theme.colors.foreground,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing[12],
      paddingHorizontal: theme.spacing[4],
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    emptyTitle: {
      ...theme.typography.h3,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.foreground,
      marginBottom: theme.spacing[2],
    },
    emptyDescription: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: theme.spacing[4],
    },
    emptyButton: {
      borderRadius: theme.borderRadius.button,
      overflow: 'hidden',
    },
    emptyButtonGradient: {
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyButtonText: {
      ...theme.typography.button,
      color: theme.colors.primaryForeground,
      fontWeight: theme.fontWeights.medium,
    },
    promisesList: {
      gap: theme.spacing[6],
      ...Platform.select({
        web: {
          flexDirection: 'row',
          flexWrap: 'wrap',
        },
      }),
    },
    promisesListSectionAfter: {
      marginTop: theme.spacing[6],
    },
    promiseCard: {
      padding: theme.spacing[5], // p-5 = 20px
      borderRadius: 24, // rounded-3xl = 24px
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        web: {
          transition: 'all 0.3s',
          width: 'calc(33.333% - 16px)', // Three columns with gap
          minWidth: 250,
          cursor: 'pointer',
        },
      }),
    },
    promiseCardHovered: {
      borderColor:'rgba(20, 184, 170, 0.4)'
    },
    promiseCardCompleted: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(20, 184, 166, 0.1)' : '#EBF8F6',
    },
    promiseCardNotMade: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', // red-50, fail-state tint
    },
    promiseCardNotMadeHovered: {
      borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    promiseCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[3], // mb-3 = 12px
    },
    promiseCardHeaderLeft: {
      flex: 1,
    },
    promiseCardBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2], // gap-2 = 8px
      marginBottom: theme.spacing[1], // mb-1 = 4px
    },
    roleBadge: {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: 2,
      borderRadius: 6,
    },
    roleBadgeFromMe: {
      backgroundColor: 'rgba(20, 184, 166, 0.12)',
    },
    roleBadgeTextFromMe: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: '#0d9488',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    roleBadgeToMe: {
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
    },
    roleBadgeTextToMe: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: '#2563eb',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    roleBadgeMentoring: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    roleBadgeTextMentoring: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: '#d97706',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    socialBadge: {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: 2,
      borderRadius: 6, // rounded-md = 6px
      backgroundColor: 'rgba(20, 184, 166, 0.1)', // teal-500/10
    },
    socialBadgeText: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: '#0d9488', // teal-600
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    daysLeftBadge: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
    },
    daysLeftBadgeUrgent: {
      backgroundColor: 'transparent',
    },
    daysLeftText: {
      fontSize: 10,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    daysLeftTextUrgent: {
      color: '#ef4444', // red-500
    },
    promiseTitle: {
      fontSize: 20, // text-xl = 20px
      fontFamily: fontFamilies.display, // font-display
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
    },
    promiseTitleHovered: {
      color: '#14B8AA',
    },
    moreButton: {
      width: 32, // w-8 = 32px
      height: 32, // h-8 = 32px
      borderRadius: 9999, // rounded-full
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      ...Platform.select({
        web: {
          cursor: 'default',
        },
      }),
    },
    promiseProgressContainer: {
      gap: 6, // space-y-1.5 = 6px
      marginBottom: theme.spacing[4],
    },
    promiseProgressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    promiseProgressText: {
      fontSize: 12,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    promiseProgressPercent: {
      fontSize: 12,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.foreground,
    },
    promiseCompletedText: {
      fontSize: 12,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    promiseNotMadeText: {
      fontSize: 12,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.destructive,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    progressBar: {
      height: 6, // h-1.5 = 6px
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.muted,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    progressBarGradient: {
      height: '100%',
      width: '100%',
      borderRadius: theme.borderRadius.full,
    },
    promiseCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing[4], // pt-4 = 16px
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    promiseCardFooterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2], // gap-2 = 8px
    },
    promiseCardFooterText: {
      fontSize: 12,
      fontWeight: theme.fontWeights.medium,
      color: theme.colors.mutedForeground,
    },
    viewButton: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: 8,
      borderRadius: 9999, // rounded-full
      backgroundColor: 'transparent',
    },
    viewButtonText: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: theme.fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
      ...Platform.select({
        web: {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },
        default: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    },
    menuContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[1],
      minWidth: 200,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        web: {
          boxShadow: theme.mode === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        },
      }),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      gap: theme.spacing[2],
    },
    menuItemDestructive: {
      // Separate style for destructive items
    },
    menuItemText: {
      fontSize: 14,
      color: theme.colors.foreground,
    },
    menuItemTextDestructive: {
      color: theme.colors.destructive,
    },
  });
