/**
 * Create Promise Screen
 * Form to create a new promise
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Conditional import for date picker (only for native platforms)
let DateTimePicker: any = null;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  // Package not installed, will use web date input only
}
import { useTheme } from '../theme/ThemeProvider';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { useAuth } from '../contexts/AuthContext';
import { useAchievements } from '../contexts/AchievementContext';
import { apiService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { fontFamilies } from '../theme/typography';
import {
  ArrowLeft,
  Crosshair,
  Users,
  Calendar,
  Plus,
  X,
  Check,
  Target,
} from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DesktopNav } from '../components/DesktopNav';
import { ThemeToggle } from '../components/ThemeToggle';

interface CreatePromiseProps {
  onNavigate?: (route: string) => void;
}

type PromiseType = 'personal' | 'social';

export default function CreatePromise({ onNavigate }: CreatePromiseProps) {
  const { theme } = useTheme();
  const { isDesktopView } = useIsMobileView();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { checkAndUnlockAchievement, hasAchievement } = useAchievements();
  const [type, setType] = useState<PromiseType>('personal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [promiseeEmail, setPromiseeEmail] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    deadline?: string;
    milestones?: string;
    promiseeEmail?: string;
    mentorEmail?: string;
  }>({});
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const dateInputRef = useRef<any>(null);

  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
  };

  const styles = createStyles(theme, safeInsets, isDesktopView);

  const addMilestone = () => {
    if (milestones.length < 8) {
      setMilestones([...milestones, '']);
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, value: string) => {
    const updated = [...milestones];
    updated[index] = value;
    setMilestones(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Validate deadline
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (deadline && deadline < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    // Milestones are optional - no validation needed

    // Validate promisee email if social type
    if (type === 'social') {
      if (!promiseeEmail.trim()) {
        newErrors.promiseeEmail = 'Please enter the email of the person you are promising to';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(promiseeEmail)) {
        newErrors.promiseeEmail = 'Please enter a valid email address';
      }
    }

    // Validate mentor email if provided
    if (mentorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentorEmail)) {
      newErrors.mentorEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = title.trim() && deadline;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDeadline(selectedDate);
        if (errors.deadline) {
          setErrors({ ...errors, deadline: undefined });
        }
      }
    } else if (Platform.OS === 'ios' && selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmDatePicker = () => {
    setDeadline(tempDate);
    setShowDatePicker(false);
    if (errors.deadline) {
      setErrors({ ...errors, deadline: undefined });
    }
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
    setTempDate(deadline || new Date());
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      // Format deadline as YYYY-MM-DD
      const formattedDeadline = deadline ? formatDate(deadline) : undefined;

      // Prepare milestones data
      const milestonesData = milestones
        .filter((m) => m.trim())
        .map((m, index) => ({
          title: m.trim(),
          order_index: index,
        }));

      // Try to look up promisee by email if social type (optional - will use email if not found)
      let promisee_id: string | undefined = undefined;
      let promisee_email: string | undefined = undefined;
      if (type === 'social' && promiseeEmail.trim()) {
        try {
          const promiseeResponse = await apiService.request(`/auth/lookup?email=${encodeURIComponent(promiseeEmail.trim())}`, {
            method: 'GET',
          });
          if (promiseeResponse.user && promiseeResponse.user.id) {
            promisee_id = promiseeResponse.user.id;
          } else {
            // User doesn't exist, will use email instead
            promisee_email = promiseeEmail.trim();
          }
        } catch (error: any) {
          // User doesn't exist (404) or other error - will use email instead
          console.log('User not found, will send email invitation:', promiseeEmail.trim());
          promisee_email = promiseeEmail.trim();
        }
      }

      // Try to look up mentor by email if provided (optional - will use email if not found)
      let mentor_id: string | undefined = undefined;
      let mentor_email: string | undefined = undefined;
      if (mentorEmail.trim()) {
        try {
          const mentorResponse = await apiService.request(`/auth/lookup?email=${encodeURIComponent(mentorEmail.trim())}`, {
            method: 'GET',
          });
          if (mentorResponse.user && mentorResponse.user.id) {
            mentor_id = mentorResponse.user.id;
          } else {
            // User doesn't exist, will use email instead
            mentor_email = mentorEmail.trim();
          }
        } catch (error: any) {
          // User doesn't exist (404) or other error - will use email instead
          console.log('Mentor not found, will send email invitation:', mentorEmail.trim());
          mentor_email = mentorEmail.trim();
        }
      }

      const promiseData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: formattedDeadline,
        promisee_id,
        promisee_email,
        mentor_id,
        mentor_email,
        milestones: milestonesData.length > 0 ? milestonesData : undefined,
      };

      const response = await apiService.request('/promises', {
        method: 'POST',
        body: JSON.stringify(promiseData),
      });

      // Show success toast
      showToast('Promise created successfully!', 'success');

      // Check for achievements
      // First promise achievement
      await checkAndUnlockAchievement('first_promise');

      // Social promise achievement (check if promisee exists or email was provided)
      if (type === 'social' && (promisee_id || promisee_email)) {
        await checkAndUnlockAchievement('first_social_promise');
      }

      // Mentor achievement (check if mentor exists or email was provided)
      if (mentor_id || mentor_email) {
        await checkAndUnlockAchievement('first_mentor');
      }

      // Check promise count achievements (would need to fetch count from API)
      // For now, we'll check these on the Promises screen
      
      // Navigate back after a short delay to show the toast/achievement
      setTimeout(() => {
        onNavigate?.('promises');
      }, 500);
    } catch (error: any) {
      console.error('Failed to create promise:', error);
      const errorMessage = error.error || 'Failed to create promise. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Make a Promise</Text>
          </View>
          <View style={styles.headerRight}>
            <DesktopNav currentRoute="/create" onNavigate={onNavigate || (() => {})} />
            <ThemeToggle />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Promise Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who is this promise to?</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                type === 'personal' && styles.typeCardActive,
              ]}
              onPress={() => setType('personal')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.typeIcon,
                  type === 'personal' ? styles.typeIconActive : styles.typeIconInactive,
                ]}
              >
                <Crosshair
                  size={20}
                  color={
                    type === 'personal'
                      ? theme.colors.primaryForeground
                      : theme.colors.mutedForeground
                  }
                />
              </View>
              <Text style={styles.typeTitle}>Myself</Text>
              <Text style={styles.typeDesc}>A personal commitment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeCard, type === 'social' && styles.typeCardActiveSocial]}
              onPress={() => setType('social')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.typeIcon,
                  type === 'social' ? styles.typeIconActiveSocial : styles.typeIconInactive,
                ]}
              >
                <Users
                  size={20}
                  color={
                    type === 'social'
                      ? theme.colors.accentForeground
                      : theme.colors.mutedForeground
                  }
                />
              </View>
              <Text style={styles.typeTitle}>To Someone</Text>
              <Text style={styles.typeDesc}>A promise made to someone else</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>What are you promising?</Text>
            <Input
              placeholder="I promise to..."
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) {
                  setErrors({ ...errors, title: undefined });
                }
              }}
              style={styles.titleInput}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Why does this matter? <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.textArea,
                focusedField === 'description' && styles.textAreaFocused,
              ]}
              placeholder="This is important to me because..."
              placeholderTextColor={theme.colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>When will you complete this?</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputWrapper}>
                <View style={[
                  styles.dateInputContainer,
                  focusedField === 'deadline' && styles.dateInputContainerFocused,
                  errors.deadline && styles.dateInputContainerError,
                ]}>
                  <Calendar size={20} color={theme.colors.mutedForeground} />
                  {/* @ts-ignore - native HTML input for web date picker */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={deadline ? formatDate(deadline) : ''}
                    onFocus={() => setFocusedField('deadline')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value) {
                        const selectedDate = new Date(value + 'T00:00:00');
                        if (!isNaN(selectedDate.getTime())) {
                          setDeadline(selectedDate);
                          if (errors.deadline) {
                            setErrors({ ...errors, deadline: undefined });
                          }
                        }
                      } else {
                        setDeadline(null);
                      }
                    }}
                    placeholder="Select a date"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      outlineWidth: 0,
                      outlineStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: theme.fontSizes.base,
                      fontWeight: theme.fontWeights.regular,
                      fontFamily: fontFamilies.button,
                      color: theme.colors.foreground,
                      backgroundColor: 'transparent',
                      colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
                      height: '100%',
                      width: '100%',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      boxShadow: 'none',
                      borderStyle: 'none',
                    } as React.CSSProperties}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.dateInputContainer,
                  focusedField === 'deadline' && styles.dateInputContainerFocused,
                  errors.deadline && styles.dateInputContainerError,
                ]}
                onPress={() => {
                  setFocusedField('deadline');
                  if (DateTimePicker) {
                    setTempDate(deadline || new Date());
                    setShowDatePicker(true);
                  } else {
                    // Fallback for native if package not installed
                    showToast('Date picker not available. Please install @react-native-community/datetimepicker', 'error');
                  }
                }}
                activeOpacity={0.7}
              >
                <Calendar size={20} color={theme.colors.mutedForeground} />
                <Text style={[
                  styles.dateInputText,
                  !deadline && styles.dateInputPlaceholder,
                ]}>
                  {deadline ? formatDate(deadline) : 'Select a date'}
                </Text>
              </TouchableOpacity>
            )}
            {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
            
            {/* Date Picker Modal for iOS/Android */}
            {showDatePicker && Platform.OS !== 'web' && DateTimePicker && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
                onRequestClose={cancelDatePicker}
              >
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerContainer}>
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={cancelDatePicker}>
                          <Text style={styles.datePickerButton}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDatePicker}>
                          <Text style={[styles.datePickerButton, styles.datePickerButtonConfirm]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      {...(Platform.OS === 'ios' && { textColor: theme.colors.foreground })}
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {type === 'social' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Promise To (Required)</Text>
              <Text style={styles.labelDesc}>
                The person you are making this promise to
              </Text>
              <Input
                placeholder="friend@email.com"
                value={promiseeEmail}
                onChangeText={(text) => {
                  setPromiseeEmail(text);
                  if (errors.promiseeEmail) {
                    setErrors({ ...errors, promiseeEmail: undefined });
                  }
                }}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.promiseeEmail && <Text style={styles.errorText}>{errors.promiseeEmail}</Text>}
            </View>
          )}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Mentor (Watcher) <Text style={styles.optional}>(optional)</Text>
            </Text>
            <Text style={styles.labelDesc}>
              Someone who watches your progress (e.g., parent, spouse, friend)
            </Text>
            <Input
              placeholder="mentor@email.com"
              value={mentorEmail}
              onChangeText={(text) => {
                setMentorEmail(text);
                if (errors.mentorEmail) {
                  setErrors({ ...errors, mentorEmail: undefined });
                }
              }}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.mentorEmail && <Text style={styles.errorText}>{errors.mentorEmail}</Text>}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.milestonesHeader}>
            <View>
              <Text style={styles.label}>Milestones <Text style={styles.optional}>(optional)</Text></Text>
              <Text style={styles.labelDesc}>Break it down into steps</Text>
            </View>
            <Text style={styles.milestoneCount}>
              {milestones.filter((m) => m.trim()).length}/8
            </Text>
          </View>

            <View style={styles.milestonesList}>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <LinearGradient
                  colors={theme.gradients.button.colors}
                  start={theme.gradients.button.start}
                  end={theme.gradients.button.end}
                  style={styles.milestoneNumber}
                >
                  <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                </LinearGradient>
                <Input
                  placeholder={`Step ${index + 1}...`}
                  value={milestone}
                  onChangeText={(value) => {
                    updateMilestone(index, value);
                    if (errors.milestones) {
                      setErrors({ ...errors, milestones: undefined });
                    }
                  }}
                  style={styles.milestoneInput}
                />
                {milestones.length > 0 && (
                  <TouchableOpacity
                    style={styles.removeMilestone}
                    onPress={() => removeMilestone(index)}
                  >
                    <X size={16} color={theme.colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {errors.milestones && (
            <Text style={styles.errorText}>{errors.milestones}</Text>
          )}

          {milestones.length < 8 && (
            <TouchableOpacity
              style={styles.addMilestoneButton}
              onPress={addMilestone}
              activeOpacity={0.7}
            >
              <Plus size={16} color={theme.colors.foreground} />
              <Text style={styles.addMilestoneText}>Add Step</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid || loading}
            style={styles.submitButtonContainer}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={theme.gradients.button.colors}
              start={theme.gradients.button.start}
              end={theme.gradients.button.end}
              style={[
                styles.submitButton,
                (!isValid || loading) && styles.submitButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.primaryForeground} size="small" />
              ) : (
                <View style={styles.submitButtonContent}>
                  <Check size={20} color={theme.colors.primaryForeground} />
                  <Text style={styles.submitButtonText}>
                    {isValid ? 'Commit to This Promise' : 'Fill in the details'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: any, insets: { top: number; bottom: number }, isDesktopView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Math.max((insets?.top ?? 0) - 5, 0), // 5px smaller top gap
      paddingBottom: insets?.bottom ?? 0,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      maxWidth: isDesktopView ? 700 : '100%',
      alignSelf: isDesktopView ? 'center' : 'stretch',
      width: '100%',
      ...(isDesktopView && { justifyContent: 'space-between' }),
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.medium,
    },
    headerTitle: {
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.semibold,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing[6],
      paddingBottom: theme.spacing[4] + (insets?.bottom ?? 0),
      maxWidth: isDesktopView ? 700 : '100%',
      alignSelf: isDesktopView ? 'center' : 'stretch',
      width: '100%',
      gap: theme.spacing[6],
    },
    section: {
      marginBottom: theme.spacing[8],
      padding: theme.spacing[5],
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      ...Platform.select({
        web: {
          boxShadow: theme.mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        default: {
          ...theme.shadows.sm,
        },
      }),
    },
    sectionTitle: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.semibold,
      fontFamily: fontFamilies.button,
      marginBottom: theme.spacing[4],
      color: theme.colors.foreground,
    },
    formSection: {
      gap: theme.spacing[6],
      marginBottom: theme.spacing[8],
      padding: theme.spacing[5],
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      ...Platform.select({
        web: {
          boxShadow: theme.mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        default: {
          ...theme.shadows.sm,
        },
      }),
    },
    typeContainer: {
      flexDirection: 'row',
      gap: theme.spacing[4],
    },
    typeCard: {
      flex: 1,
      padding: theme.spacing[5],
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      alignItems: 'flex-start',
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: theme.mode === 'dark' 
            ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
            : '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        default: {
          ...theme.shadows.sm,
        },
      }),
    },
    typeCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.card,
    },
    typeCardActiveSocial: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.card,
    },
    typeIcon: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[3],
    },
    typeIconInactive: {
      backgroundColor: theme.colors.muted,
    },
    typeIconActive: {
      backgroundColor: theme.colors.primary,
    },
    typeIconActiveSocial: {
      backgroundColor: theme.colors.accent,
    },
    typeTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      fontFamily: fontFamilies.button,
      marginBottom: theme.spacing[0.5],
      color: theme.colors.foreground,
    },
    typeDesc: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.mutedForeground,
    },
    fieldContainer: {
      marginBottom: theme.spacing[1],
    },
    label: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.semibold,
      fontFamily: fontFamilies.button,
      marginBottom: theme.spacing[2],
      color: theme.colors.foreground,
    },
    labelDesc: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.mutedForeground,
      marginTop: -theme.spacing[1],
      marginBottom: theme.spacing[2],
    },
    required: {
      color: theme.colors.destructive,
      fontFamily: fontFamilies.button,
    },
    optional: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.mutedForeground,
    },
    titleInput: {
      fontSize: theme.fontSizes.lg,
      height: 48,
    },
    input: {
      fontSize: theme.fontSizes.base,
      height: 48,
    },
    textArea: {
      minHeight: 100,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border, // Gray by default
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
      textAlignVertical: 'top',
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
    textAreaFocused: {
      borderColor: theme.colors.primary, // Teal on focus
    },
    dateInputWrapper: {
      position: 'relative',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        },
      }),
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border, // Gray by default
      borderRadius: theme.borderRadius.medium,
      paddingLeft: theme.spacing[3],
      paddingRight: theme.spacing[3],
      backgroundColor: theme.colors.card,
      height: 48,
      gap: theme.spacing[3],
      ...Platform.select({
        web: {
          position: 'relative',
          outline: 'none',
          outlineWidth: 0,
          outlineStyle: 'none',
          borderStyle: 'solid',
          boxShadow: 'none',
        },
      }),
    },
    dateInputContainerFocused: {
      borderColor: theme.colors.primary, // Teal on focus
    },
    dateInputContainerError: {
      borderColor: theme.colors.destructive,
    },
    dateInputText: {
      flex: 1,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
    },
    dateInputPlaceholder: {
      color: theme.colors.mutedForeground,
    },
    dateInputWeb: {
      flex: 1,
      borderWidth: 0,
      paddingHorizontal: 0,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
      height: '100%',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        },
      }),
    },
    dateInputWebNative: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: 0,
      margin: 0,
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
      backgroundColor: 'transparent',
      height: '100%',
      width: '100%',
      cursor: 'pointer',
      ...Platform.select({
        web: {
          // Webkit date picker styling
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          '&::-webkit-calendar-picker-indicator': {
            cursor: 'pointer',
            opacity: 0.7,
          },
        },
      }),
    } as any,
    errorText: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.destructive,
      marginTop: theme.spacing[1],
    },
    datePickerModal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerContainer: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    datePickerButton: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.regular,
      fontFamily: fontFamilies.button,
      color: theme.colors.foreground,
    },
    datePickerButtonConfirm: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeights.semibold,
    },
    milestonesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    milestoneCount: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
      color: theme.colors.mutedForeground,
    },
    milestonesList: {
      gap: theme.spacing[3],
      marginBottom: theme.spacing[4],
    },
    milestoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    milestoneNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    milestoneNumberText: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      fontFamily: fontFamilies.button,
      color: theme.colors.primaryForeground,
    },
    milestoneInput: {
      flex: 1,
    },
    removeMilestone: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    addMilestoneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[3],
      borderWidth: 1.5,
      ...Platform.select({
        web: {
          borderStyle: 'dashed',
        },
        default: {
          borderStyle: 'solid',
        },
      }),
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.medium,
      width: '100%',
      backgroundColor: theme.mode === 'dark' 
        ? 'rgba(20, 184, 166, 0.05)' 
        : 'rgba(20, 184, 166, 0.02)',
    },
    addMilestoneText: {
      fontSize: theme.fontSizes.base,
      fontWeight: theme.fontWeights.medium,
      fontFamily: fontFamilies.button,
      color: theme.colors.primary,
    },
    submitContainer: {
      marginTop: theme.spacing[2],
      paddingTop: theme.spacing[6],
    },
    submitButtonContainer: {
      borderRadius: theme.borderRadius.button,
      overflow: 'hidden',
      width: '100%',
    },
    submitButton: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[8],
      borderRadius: theme.borderRadius.button,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    submitButtonText: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.medium,
      fontFamily: fontFamilies.button,
      color: theme.colors.primaryForeground,
    },
  });
