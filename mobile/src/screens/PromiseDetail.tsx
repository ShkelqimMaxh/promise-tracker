/**
 * Promise Detail Screen
 * Shows full details of a single promise with milestones and notes
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
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { DesktopNav } from '../components/DesktopNav';
import {
  ArrowLeft,
  Calendar,
  Crosshair,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  MinusCircle,
  Trash2,
  MessageSquare,
  Plus,
  BarChart3,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';

interface PromiseDetailProps {
  promiseId: string;
  onNavigate?: (route: string) => void;
}

interface Milestone {
  id: string;
  promise_id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface PromiseNote {
  id: string;
  promise_id: string;
  user_id: string;
  note_text: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface PromiseDetail {
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
  milestones?: Milestone[];
  notes?: PromiseNote[];
}

export default function PromiseDetail({ promiseId, onNavigate }: PromiseDetailProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [promise, setPromise] = useState<PromiseDetail | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [notes, setNotes] = useState<PromiseNote[]>([]);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [togglingMilestone, setTogglingMilestone] = useState<string | null>(null);

  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
  };

  const styles = createStyles(theme, safeInsets);

  useEffect(() => {
    loadPromiseDetail();
  }, [promiseId]);

  const loadPromiseDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.request<{ promise: PromiseDetail }>(
        `/promises/${promiseId}`,
        { method: 'GET' }
      );
      setPromise(response.promise);
      setMilestones(response.promise.milestones || []);
      setNotes(response.promise.notes || []);
    } catch (error: any) {
      console.error('Failed to load promise:', error);
      showToast(error.error || 'Failed to load promise', 'error');
      onNavigate?.('promises');
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (deadline: string | null | undefined): number => {
    if (!deadline) return 0;
    try {
      return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProgress = (): number => {
    if (!milestones.length) return 0;
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const toggleMilestone = async (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    setTogglingMilestone(milestoneId);
    const newCompleted = !milestone.completed;

    try {
      await apiService.request(
        `/promises/${promiseId}/milestones/${milestoneId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ completed: newCompleted }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Reload promise data to get updated milestones
      await loadPromiseDetail();

      showToast(
        newCompleted ? 'Milestone completed!' : 'Milestone unmarked',
        'success'
      );
    } catch (error: any) {
      console.error('Failed to toggle milestone:', error);
      showToast(error.error || 'Failed to update milestone', 'error');
    } finally {
      setTogglingMilestone(null);
    }
  };

  const addCheckIn = async () => {
    if (!checkInNote.trim()) return;

    setSubmittingNote(true);
    try {
      const response = await apiService.request<{ note: PromiseNote }>(
        `/promises/${promiseId}/notes`,
        {
          method: 'POST',
          body: JSON.stringify({ note_text: checkInNote.trim() }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Reload promise detail to get updated notes with user info
      await loadPromiseDetail();
      setCheckInNote('');
      setCheckInModalVisible(false);
      showToast('Check-in added!', 'success');
    } catch (error: any) {
      console.error('Failed to add check-in:', error);
      showToast(error.error || 'Failed to add check-in', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Promise',
      'Are you sure you want to delete this promise? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.request(`/promises/${promiseId}`, {
                method: 'DELETE',
              });
              showToast('Promise deleted', 'success');
              onNavigate?.('promises');
            } catch (error: any) {
              console.error('Failed to delete promise:', error);
              showToast(error.error || 'Failed to delete promise', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!promise) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Promise not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.('promises')}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const days = promise.deadline ? getDaysLeft(promise.deadline) : 0;
  const progress = getProgress();
  const isPersonal = !promise.promisee_id && !promise.mentor_id;
  const isOverdue = promise.status === 'overdue' || (promise.deadline && days < 0 && promise.status !== 'completed');
  const isPromisee = promise.promisee_id === user?.id && promise.user_id !== user?.id;
  const canDecline = isPromisee && promise.status === 'ongoing';
  
  const handleDeclinePromise = async () => {
    Alert.alert(
      'Decline Promise',
      'Are you sure you want to decline this promise? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.request(`/promises/${promiseId}/decline`, {
                method: 'POST',
              });
              showToast('Promise declined', 'success');
              onNavigate?.('promises');
            } catch (error: any) {
              console.error('Failed to decline promise:', error);
              showToast(error.error || 'Failed to decline promise', 'error');
            }
          },
        },
      ]
    );
  };
  
  const handleCompletePromise = async () => {
    if (!promise || promise.status === 'completed') return;
    
    try {
      const response = await apiService.request(`/promises/${promise.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (response.promise) {
        setPromise(response.promise);
        showToast('Promise marked as completed!', 'success');
        onNavigate?.('promises');
      }
    } catch (error: any) {
      console.error('Failed to complete promise:', error);
      showToast(error.error || 'Failed to complete promise', 'error');
    }
  };

  const handleMarkAsNotMade = async () => {
    if (!promise || promise.status === 'not_made') return;
    
    try {
      const response = await apiService.request(`/promises/${promise.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'not_made' }),
      });
      
      if (response.promise) {
        setPromise(response.promise);
        showToast('Marked as not made.', 'success');
        onNavigate?.('promises');
      }
    } catch (error: any) {
      console.error('Failed to mark as not made:', error);
      showToast(error.error || 'Failed to update promise', 'error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => onNavigate?.('promises')}
            >
              <ArrowLeft size={20} color={theme.colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {promise.title}
            </Text>
          </View>
          <DesktopNav currentRoute={`/promise/${promiseId}`} onNavigate={onNavigate || (() => {})} />
          <View style={styles.headerActions}>
            {canDecline && (
              <TouchableOpacity style={styles.headerButton} onPress={handleDeclinePromise}>
                <XCircle size={18} color={theme.colors.destructive} />
              </TouchableOpacity>
            )}
            {promise.user_id === user?.id && (
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Trash2 size={18} color={theme.colors.destructive} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* Left Column: Promise Info, Progress, Actions */}
          <View style={styles.leftColumn}>
            {/* Promise Info */}
            <View style={styles.section}>
              <View style={styles.promiseInfoBlock}>
                <View style={styles.promiseHeader}>
            <View
              style={[
                styles.promiseIcon,
                {
                  backgroundColor: isPersonal
                    ? theme.colors.primary + '1A'
                    : theme.colors.accent + '1A',
                },
              ]}
            >
              {isPersonal ? (
                <Crosshair size={24} color={theme.colors.primary} />
              ) : (
                <Users size={24} color={theme.colors.accent} />
              )}
            </View>
            <View style={styles.promiseHeaderText}>
              <Text style={styles.promiseTypeLabel}>
                {isPersonal 
                  ? 'Promise to myself' 
                  : promise.promisee_id 
                    ? `Promise to ${promise.promisee?.name || 'someone'}` 
                    : ''}
              </Text>
              {promise.mentor_id && (
                <Text style={styles.mentorLabel}>
                  Watched by: {promise.mentor?.name || 'mentor'}
                </Text>
              )}
              <Text style={styles.promiseTitle}>{promise.title}</Text>
            </View>
          </View>

          {promise.description && (
            <Text style={styles.description}>{promise.description}</Text>
          )}

          <View style={styles.metaInfo}>
            {promise.status !== 'completed' && promise.status !== 'not_made' && promise.deadline ? (
              <View style={styles.metaItem}>
                <Calendar size={16} color={theme.colors.mutedForeground} />
                <Text style={styles.metaText}>
                  {days > 0
                    ? `${days} days left`
                    : days === 0
                    ? 'Due today'
                    : `${Math.abs(days)} days overdue`}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.mutedForeground} />
              <Text style={styles.metaText}>
                Started {formatDate(promise.created_at)}
              </Text>
            </View>
          </View>
        </View>
          </View>

        {/* Progress */}
        {milestones.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressCardContent}>
              <View style={styles.progressHeader}>
                <View style={styles.progressHeaderLeft}>
                  <BarChart3 size={20} color="#2F3C5E" />
                  <Text style={styles.progressLabel}>Progress</Text>
                </View>
                <View style={styles.progressValueContainer}>
                  <Text style={styles.progressValueNumber}>{progress}</Text>
                  <Text style={styles.progressValuePercent}>%</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.max(progress, 1)}%`,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        promise.status === 'completed'
                          ? [theme.colors.success + 'CC', theme.colors.success]
                          : ['#8B9AB8', '#2F3C5E']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressBarGradient}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {promise.status !== 'completed' && promise.status !== 'declined' && promise.status !== 'not_made' && (
          <View style={styles.section}>
            <View style={styles.actionButtonsContainer}>
              {promise.user_id === user?.id || canDecline ? (
                // Show Complete button for owner or promisee
                <TouchableOpacity
                  onPress={handleCompletePromise}
                  activeOpacity={0.8}
                  style={styles.primaryActionButton}
                >
                  <LinearGradient
                    colors={theme.gradients.button.colors}
                    start={theme.gradients.button.start}
                    end={theme.gradients.button.end}
                    style={styles.completeButton}
                  >
                    <CheckCircle2 size={20} color={theme.colors.primaryForeground} />
                    <Text style={styles.completeButtonText}>Mark as Completed</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : null}
              {promise.user_id === user?.id && (
                <TouchableOpacity
                  onPress={handleMarkAsNotMade}
                  activeOpacity={0.8}
                  style={styles.secondaryActionButton}
                >
                  <View
                    style={[
                      styles.declineButton,
                      { borderColor: theme.colors.mutedForeground },
                    ]}
                  >
                    <MinusCircle size={16} color={theme.colors.mutedForeground} />
                    <Text style={[styles.declineButtonText, { color: theme.colors.mutedForeground }]}>
                      Mark as Not Made
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {canDecline && (
                // Show smaller Decline button for promisee
                <TouchableOpacity
                  onPress={handleDeclinePromise}
                  activeOpacity={0.8}
                  style={styles.secondaryActionButton}
                >
                  <View
                    style={[
                      styles.declineButton,
                      { borderColor: theme.colors.destructive },
                    ]}
                  >
                    <XCircle size={16} color={theme.colors.destructive} />
                    <Text style={[styles.declineButtonText, { color: theme.colors.destructive }]}>
                      Decline
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

          </View>
          {/* Right Column: Milestones, Check-ins */}
          <View style={styles.rightColumn}>
        {/* Milestones */}
        {milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <View style={styles.milestonesList}>
              {milestones.map((milestone, index) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    milestone.completed && styles.milestoneCardCompleted,
                    togglingMilestone === milestone.id && styles.milestoneCardLoading,
                  ]}
                  onPress={() => toggleMilestone(milestone.id)}
                  disabled={togglingMilestone === milestone.id}
                >
                  <View
                    style={[
                      styles.milestoneIcon,
                      milestone.completed && styles.milestoneIconCompleted,
                    ]}
                  >
                    {togglingMilestone === milestone.id ? (
                      <ActivityIndicator
                        size="small"
                        color={milestone.completed ? '#FFFFFF' : theme.colors.mutedForeground}
                      />
                    ) : milestone.completed ? (
                      <CheckCircle2 size={20} color="#FFFFFF" />
                    ) : (
                      <Circle size={20} color={theme.colors.mutedForeground} />
                    )}
                  </View>
                  <View style={styles.milestoneContent}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        milestone.completed && styles.milestoneTitleCompleted,
                      ]}
                    >
                      {milestone.title}
                    </Text>
                    {milestone.completed && milestone.updated_at && (
                      <Text style={styles.milestoneDate}>
                        Completed {formatDate(milestone.updated_at)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Check-ins / Notes */}
        <View style={styles.section}>
          <View style={styles.checkInsHeader}>
            <View style={styles.checkInsHeaderLeft}>
              <MessageSquare size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Check-ins</Text>
            </View>
            <TouchableOpacity
              onPress={() => setCheckInModalVisible(true)}
              style={styles.addButtonContainer}
            >
              <LinearGradient
                colors={theme.gradients.button.colors}
                start={theme.gradients.button.start}
                end={theme.gradients.button.end}
                style={styles.addButton}
              >
                <Plus size={16} color={theme.colors.primaryForeground} />
                <Text style={styles.addButtonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {notes.length > 0 ? (
            <View style={styles.notesList}>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteAvatar}>
                      <Text style={styles.noteAvatarText}>
                        {(note.user_name || user?.name || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </Text>
                    </View>
                    <View style={styles.noteHeaderText}>
                      <Text style={styles.noteAuthor}>
                        {note.user_id === user?.id ? 'You' : note.user_name || 'User'}
                      </Text>
                      <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={styles.noteText}>{note.note_text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyNotes}>
              <MessageSquare size={40} color={theme.colors.mutedForeground} />
              <Text style={styles.emptyNotesText}>
                No check-ins yet. Share your progress!
              </Text>
            </View>
          )}
        </View>
          </View>
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <Modal
        visible={checkInModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckInModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.modalKeyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>How's it going?</Text>
                <TouchableOpacity
                  onPress={() => setCheckInModalVisible(false)}
                  style={styles.modalClose}
                >
                  <X size={20} color={theme.colors.foreground} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalTextArea}
                placeholder="Share your progress, wins, or challenges..."
                placeholderTextColor={theme.colors.mutedForeground}
                value={checkInNote}
                onChangeText={setCheckInNote}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => setCheckInModalVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: theme.colors.foreground }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, { opacity: checkInNote.trim() && !submittingNote ? 1 : 0.5 }]}
                  onPress={addCheckIn}
                  disabled={!checkInNote.trim() || submittingNote}
                >
                  <LinearGradient
                    colors={theme.gradients.button.colors}
                    start={theme.gradients.button.start}
                    end={theme.gradients.button.end}
                    style={styles.modalSaveGradient}
                  >
                    {submittingNote ? (
                      <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
                    ) : (
                      <Text style={styles.modalSaveText}>Save Check-in</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Platform.OS === 'web' ? '#f8fafc' : theme.colors.background, // slate-50 for desktop to match Promises/Create
      paddingTop: Math.max((insets?.top ?? 0) - 5, 0), // 5px smaller top gap
      paddingBottom: insets?.bottom ?? 0,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
      marginBottom: theme.spacing[4],
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: Platform.OS === 'web' ? '#e2e8f0' : theme.colors.border,
      ...Platform.select({
        web: {
          position: 'sticky' as any,
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      }),
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      maxWidth: 1152,
      width: '100%',
      alignSelf: 'center',
      gap: theme.spacing[4],
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      flex: 1,
      minWidth: 0,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...theme.typography.h3,
      flex: 1,
      marginHorizontal: theme.spacing[2],
      fontWeight: theme.fontWeights.semibold,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing[2],
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing[4],
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[8] + (insets?.bottom ?? 0),
      maxWidth: 1152,
      width: '100%',
      alignSelf: 'center',
    },
    contentContainer: {
      width: '100%',
      ...Platform.select({
        web: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing[6],
        },
      }),
    },
    leftColumn: {
      ...Platform.select({
        web: {
          width: 380,
          flexShrink: 0,
        },
      }),
    },
    rightColumn: {
      ...Platform.select({
        web: {
          flex: 1,
          minWidth: 0,
        },
      }),
    },
    promiseInfoBlock: {
      ...Platform.select({
        web: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[5],
        },
      }),
    },
    section: {
      marginBottom: theme.spacing[8],
    },
    promiseHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[4],
    },
    promiseIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    promiseHeaderText: {
      flex: 1,
      minWidth: 0,
    },
    promiseTypeLabel: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.mutedForeground,
      marginBottom: theme.spacing[0.5],
    },
    mentorLabel: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      color: theme.colors.mutedForeground,
      marginBottom: theme.spacing[0.5],
    },
    promiseTitle: {
      ...theme.typography.h2,
      fontSize: 24,
      fontWeight: theme.fontWeights.bold,
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
      lineHeight: 24,
      marginTop: 0,
      marginBottom: theme.spacing[4],
    },
    metaInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[4],
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1.5],
    },
    metaText: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.mutedForeground,
    },
    progressCard: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: '#F8F8F8',
      marginBottom: theme.spacing[8],
      overflow: 'hidden',
      ...Platform.select({
        web: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
        },
      }),
    },
    progressCardContent: {
      padding: theme.spacing[6],
      width: '100%',
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    progressHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    progressLabel: {
      ...theme.typography.h4,
      fontWeight: theme.fontWeights.semibold,
      color: '#2F3C5E',
    },
    progressValueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    progressValueNumber: {
      ...theme.typography.h1,
      fontSize: 30,
      fontWeight: theme.fontWeights.bold,
      color: '#6B4E3B',
    },
    progressValuePercent: {
      ...theme.typography.h1,
      fontSize: 30,
      fontWeight: theme.fontWeights.bold,
      color: '#A66E3A',
    },
    progressBarContainer: {
      marginTop: 0,
    },
    progressBarBackground: {
      height: 12,
      borderRadius: theme.borderRadius.full,
      backgroundColor: '#CED2D9',
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
    actionButtonsContainer: {
      gap: theme.spacing[3],
      marginTop: theme.spacing[4],
    },
    primaryActionButton: {
      flex: 1,
    },
    secondaryActionButton: {
      alignSelf: 'flex-start',
    },
    completeButton: {
      borderRadius: theme.borderRadius.button,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[6],
    },
    completeButtonText: {
      ...theme.typography.button,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.primaryForeground,
    },
    declineButton: {
      borderRadius: theme.borderRadius.button,
      borderWidth: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[1.5],
      paddingVertical: theme.spacing[2.5],
      paddingHorizontal: theme.spacing[4],
      backgroundColor: 'transparent',
    },
    declineButtonText: {
      ...theme.typography.button,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
    },
    sectionTitle: {
      ...theme.typography.h4,
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      marginBottom: theme.spacing[4],
    },
    milestonesList: {
      gap: theme.spacing[3],
    },
    milestoneCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...Platform.select({
        web: {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
        },
      }),
    },
    milestoneCardCompleted: {
      backgroundColor: theme.colors.success + '0D',
      borderColor: theme.colors.success + '33',
    },
    milestoneCardLoading: {
      opacity: 0.6,
    },
    milestoneIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    milestoneIconCompleted: {
      backgroundColor: theme.colors.success,
    },
    milestoneContent: {
      flex: 1,
    },
    milestoneTitle: {
      ...theme.typography.body,
      fontWeight: theme.fontWeights.medium,
    },
    milestoneTitleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.mutedForeground,
    },
    milestoneDate: {
      ...theme.typography.caption,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.mutedForeground,
      marginTop: theme.spacing[0.5],
    },
    checkInsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    checkInsHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    addButtonContainer: {
      borderRadius: theme.borderRadius.medium,
      overflow: 'hidden',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1],
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.medium,
    },
    addButtonText: {
      ...theme.typography.button,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.primaryForeground,
    },
    notesList: {
      gap: theme.spacing[4],
    },
    noteCard: {
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...Platform.select({
        web: {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
        },
      }),
    },
    noteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[2],
    },
    noteAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteAvatarText: {
      ...theme.typography.caption,
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.primaryForeground,
    },
    noteHeaderText: {
      flex: 1,
    },
    noteAuthor: {
      ...theme.typography.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
    },
    noteDate: {
      ...theme.typography.caption,
      fontSize: theme.fontSizes.xs,
      color: theme.colors.mutedForeground,
    },
    noteText: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
      marginLeft: 44, // Align with text after avatar
    },
    emptyNotes: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[8],
      paddingHorizontal: theme.spacing[4],
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...Platform.select({
        web: {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
        },
      }),
    },
    emptyNotesText: {
      ...theme.typography.body,
      marginTop: theme.spacing[3],
      color: theme.colors.mutedForeground,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      ...Platform.select({
        web: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    },
    modalKeyboardAvoidingView: {
      flex: 1,
      justifyContent: 'flex-end',
      ...Platform.select({
        web: {
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        },
      }),
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing[4],
      maxHeight: '80%',
      ...Platform.select({
        web: {
          borderRadius: theme.borderRadius.xl,
          maxWidth: 480,
          width: '100%',
          marginHorizontal: 24,
        },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    modalTitle: {
      ...theme.typography.h3,
      fontWeight: theme.fontWeights.semibold,
    },
    modalClose: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTextArea: {
      minHeight: 120,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
      padding: theme.spacing[3],
      ...theme.typography.body,
      color: theme.colors.foreground,
      marginBottom: theme.spacing[4],
    },
    modalActions: {
      flexDirection: 'row',
      gap: theme.spacing[3],
    },
    modalCancelButton: {
      flex: 1,
      paddingVertical: theme.spacing[3],
      borderRadius: theme.borderRadius.button,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancelText: {
      ...theme.typography.button,
    },
    modalSaveButton: {
      flex: 1,
      borderRadius: theme.borderRadius.button,
      overflow: 'hidden',
    },
    modalSaveGradient: {
      paddingVertical: theme.spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSaveText: {
      ...theme.typography.button,
      color: theme.colors.primaryForeground,
    },
    backButton: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.button,
      backgroundColor: theme.colors.primary,
    },
    backButtonText: {
      ...theme.typography.button,
      color: theme.colors.primaryForeground,
    },
  });
