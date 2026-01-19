/**
 * Sign In / Sign Up Screen
 * Based on PromiseTracker Design System
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Target, Shield, Sparkles, ArrowRight, Crosshair } from 'lucide-react-native';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Complete auth session for Google
WebBrowser.maybeCompleteAuthSession();

interface SignInProps {
  onNavigate?: (route: string) => void;
}

export default function SignIn({ onNavigate }: SignInProps) {
  const { theme } = useTheme();
  const { isMobileView, isDesktopView } = useIsMobileView();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);
  
  // Google OAuth configuration
  // Check what credentials we have
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  
  // Check if we have Google OAuth configured for current platform
  const hasGoogleConfig = Platform.OS === 'web' 
    ? !!webClientId
    : !!(expoClientId || iosClientId || androidClientId);

  // Build config object - always provide required config for current platform
  const googleAuthConfig: any = {};
  
  if (Platform.OS === 'web') {
    // On web, webClientId is required
    if (webClientId) {
      googleAuthConfig.webClientId = webClientId;
    }
  } else {
    // On native, expoClientId is typically used
    if (expoClientId) googleAuthConfig.expoClientId = expoClientId;
    if (iosClientId) googleAuthConfig.iosClientId = iosClientId;
    if (androidClientId) googleAuthConfig.androidClientId = androidClientId;
  }

  // Always call the hook (React requirement)
  // If not configured, we need to provide a valid config format but skip the request
  // Note: On web, expo-auth-session requires webClientId, so we provide a placeholder
  // The button will be hidden if not configured, so this is just to prevent crashes
  const hookConfig = hasGoogleConfig 
    ? googleAuthConfig 
    : (Platform.OS === 'web' 
        ? { webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'not-configured-placeholder.apps.googleusercontent.com' }
        : {});

  const [request, response, promptAsync] = Google.useAuthRequest(
    hookConfig,
    { 
      skipRequest: !hasGoogleConfig,
      // On web, configure for popup/redirect
      ...(Platform.OS === 'web' && hasGoogleConfig ? {
        responseType: 'id_token',
        scopes: ['openid', 'profile', 'email'],
        extraParams: {},
      } : {})
    }
  );

  // Debug: Log request/response changes
  useEffect(() => {
    console.log('📡 Google OAuth request state:', request ? 'Ready' : 'Not ready', request);
  }, [request]);

  useEffect(() => {
    console.log('📡 Google OAuth response state:', response ? `Type: ${response.type}` : 'No response yet');
    if (response) {
      console.log('📡 Full response object:', JSON.stringify(response, null, 2));
    }
  }, [response]);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const nameInputHeight = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation on mount
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate name input height when toggling sign up
    Animated.timing(nameInputHeight, {
      toValue: isSignUp ? 70 : 0,
      duration: 300,
      useNativeDriver: false, // height animations can't use native driver
    }).start();
  }, [isSignUp]);

  // Test backend connection on mount
  useEffect(() => {
    const testConnection = async () => {
      const connected = await apiService.testConnection();
      if (!connected) {
        console.warn('Backend connection test failed. Make sure backend is running on http://localhost:3000');
      } else {
        console.log('✅ Backend connection successful');
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called', { isSignUp, email, password, name });
    
    // Clear previous errors
    setError(null);

    // Validate input
    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp && !name) {
      console.log('❌ Validation failed: missing name');
      setError('Please enter your name');
      return;
    }

    console.log('✅ Validation passed, calling API...');
    setLoading(true);

    try {
      let response;
      
      if (isSignUp) {
        console.log('📝 Registering new user...');
        // Register new user
        response = await apiService.register({
          email,
          password,
          name,
        });
        console.log('✅ Registration successful:', response);
      } else {
        console.log('🔐 Logging in...');
        // Login existing user
        response = await apiService.login({
          email,
          password,
        });
        console.log('✅ Login successful:', response);
      }

      // Store tokens and user data using auth context
      await login(response.user, response.access_token, response.refresh_token);

      // Navigate to promises page
      if (onNavigate) {
        onNavigate('promises');
      }
    } catch (err: any) {
      console.error('❌ API Error:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.error || 'Something went wrong. Please try again.';
      setError(errorMessage);
      
      // Show alert for better UX
      Alert.alert(
        isSignUp ? 'Registration Failed' : 'Login Failed',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth response
  useEffect(() => {
    console.log('Response changed:', response);
    
    if (!response || isProcessingGoogleAuth) {
      return; // No response yet or already processing
    }

    // Reset processing flag when response changes to something we're not processing
    if (response.type !== 'success') {
      setIsProcessingGoogleAuth(false);
    }

    if (response.type === 'success') {
      console.log('✅ Google OAuth success response:', JSON.stringify(response, null, 2));
      
      // Try multiple ways to get the id_token or access_token (format can vary)
      const idToken = response.params?.id_token || 
                     response.params?.idToken || 
                     response.authentication?.idToken;
      const accessToken = response.params?.access_token ||
                         response.authentication?.accessToken;
      
      console.log('🔑 Extracted idToken:', idToken ? `${idToken.substring(0, 20)}...` : 'NOT FOUND');
      console.log('🔑 Extracted accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT FOUND');
      console.log('📦 Full params:', response.params);
      console.log('📦 Authentication object:', response.authentication);
      
      if (idToken) {
        setIsProcessingGoogleAuth(true);
        handleGoogleSignIn(idToken, 'idToken');
      } else if (accessToken) {
        // Web flow: use access_token
        setIsProcessingGoogleAuth(true);
        handleGoogleSignIn(accessToken, 'accessToken');
      } else {
        console.error('❌ No token found in response. Full response:', response);
        setError('Google sign-in failed: No token received');
        setGoogleLoading(false);
        Alert.alert('Sign-In Error', 'No authentication token received from Google. Please try again.');
      }
    } else if (response.type === 'error') {
      console.error('❌ Google OAuth error:', response);
      const errorMsg = response.error?.message || response.error?.code || response.error?.toString() || 'Unknown error';
      setError(`Google sign-in failed: ${errorMsg}`);
      setGoogleLoading(false);
      Alert.alert('Google Sign-In Failed', errorMsg);
    } else if (response.type === 'dismiss') {
      // User cancelled
      console.log('👋 User cancelled Google sign-in');
      setGoogleLoading(false);
    } else {
      console.log('⚠️ Unknown response type:', response.type);
    }
  }, [response]);

  const handleGoogleSignIn = async (token: string, tokenType: 'idToken' | 'accessToken' = 'idToken') => {
    try {
      console.log(`Starting Google sign-in with ${tokenType}:`, token ? 'Token received' : 'No token');
      setGoogleLoading(true);
      setError(null);
      setIsProcessingGoogleAuth(true);
      
      console.log(`Calling backend /auth/google endpoint with ${tokenType}...`);
      const response = await apiService.googleAuth(token, tokenType);
      console.log('Backend response received:', response);
      
      if (!response || !response.user || !response.access_token) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Storing tokens and user data...');
      // Store tokens and user data using auth context
      await login(response.user, response.access_token, response.refresh_token);
      
      console.log('Login successful, navigating to promises...');
      // Navigate to promises page
      if (onNavigate) {
        onNavigate('promises');
      } else {
        console.warn('onNavigate not available');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.error || err.message || 'Google sign-in failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Google Sign-In Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
      setIsProcessingGoogleAuth(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  const styles = createStyles(theme, isDesktopView);

  const stats = [
    { value: '87%', label: 'Avg Trust Score' },
    { value: '12', label: 'Day Streak' },
    { value: '24', label: 'Promises Made' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Left Side - Features (hidden in mobile view, shown in desktop view) */}
          {isDesktopView && (
            <View style={styles.leftPanel}>
              <LinearGradient
                colors={['#0f172a', '#1e293b', 'rgba(19, 78, 74, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.leftPanelGradient}
              >
                {/* Blur effects */}
                <View style={styles.blurEffects}>
                  <View style={styles.blurCircle1} />
                  <View style={styles.blurCircle2} />
                </View>
                
                <Animated.View
                  style={[
                    styles.leftPanelContent,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  {/* Logo */}
                  <View style={styles.leftPanelLogo}>
                    <LinearGradient
                      colors={['#14b8a6', '#06b6d4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.leftPanelLogoIcon}
                    >
                      <Crosshair size={28} color="#ffffff" />
                    </LinearGradient>
                    <Text style={styles.leftPanelLogoText}>PromiseTracker</Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.leftPanelTitle}>
                    Build trust through{'\n'}commitment
                  </Text>
                  
                  {/* Description */}
                  <Text style={styles.leftPanelDescription}>
                    Track your promises, hit your milestones, and watch your reliability score grow.
                  </Text>

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                      <View key={stat.label} style={styles.statItem}>
                        {index > 0 && <View style={styles.statDivider} />}
                        <View style={styles.statContent}>
                          <Text style={styles.statValue}>{stat.value}</Text>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </LinearGradient>
            </View>
          )}

          {/* Right Side - Form */}
          <View style={styles.rightPanel}>
            <View style={styles.themeToggleContainer}>
              <ThemeToggle />
            </View>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Mobile Logo - shown in mobile view (narrow or native) */}
              {isMobileView && (
                <View style={styles.mobileLogoContainer}>
                  <View style={styles.mobileLogo}>
                    <Target size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.mobileLogoText}>PromiseTracker</Text>
                  <Text style={styles.mobileTagline}>Keep your word. Build trust.</Text>
                </View>
              )}

              {/* Desktop Title - shown in desktop view */}
              {isDesktopView && (
                <View style={styles.desktopTitleContainer}>
                  <Text style={styles.desktopTitle}>
                    {isSignUp ? 'Start your journey' : 'Welcome back'}
                  </Text>
                  <Text style={styles.desktopSubtitle}>
                    {isSignUp
                      ? 'Create an account to track your promises'
                      : 'Sign in to continue your streak'}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <Animated.View
                  style={[
                    styles.inputGroup,
                    {
                      overflow: 'hidden',
                      height: nameInputHeight,
                      opacity: nameInputHeight.interpolate({
                        inputRange: [0, 70],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                >
                  {isSignUp && (
                    <>
                      <Label>Your name</Label>
                      <Input
                        value={name}
                        onChangeText={(text) => {
                          console.log('👤 Name changed:', text);
                          setName(text);
                        }}
                        placeholder="What should we call you?"
                        autoCapitalize="words"
                      />
                    </>
                  )}
                </Animated.View>

                <View style={styles.inputGroup}>
                  <Label>Email</Label>
                  <Input
                    value={email}
                    onChangeText={(text) => {
                      console.log('📧 Email changed:', text);
                      setEmail(text);
                    }}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Label>Password</Label>
                  <Input
                    value={password}
                    onChangeText={(text) => {
                      console.log('🔒 Password changed:', text.length, 'characters');
                      setPassword(text);
                    }}
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="go"
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('🖱️ Button pressed!');
                      handleSubmit();
                    }}
                    style={styles.submitButton}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={theme.gradients.button.colors}
                      start={theme.gradients.button.start}
                      end={theme.gradients.button.end}
                      style={[styles.submitButtonGradient, loading && styles.submitButtonDisabled]}
                    >
                      {loading ? (
                        <Text style={styles.submitButtonText}>
                          {isSignUp ? 'Creating...' : 'Signing in...'}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.submitButtonText}>
                            {isSignUp ? 'Create Account' : 'Sign In'}
                          </Text>
                          <ArrowRight size={16} color={theme.colors.primaryForeground} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Google Sign-In Button - Only show if configured */}
                {hasGoogleConfig && promptAsync && (
                  <>
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.divider} />
                    </View>

                <TouchableOpacity
                  onPress={async () => {
                    if (!googleLoading && promptAsync) {
                      console.log('🔵 Google button clicked, calling promptAsync...');
                      setGoogleLoading(true);
                      try {
                        const result = await promptAsync();
                        console.log('🔵 promptAsync returned:', result);
                        
                        // Handle result directly (web often returns directly)
                        if (result?.type === 'success') {
                          console.log('✅ Success from promptAsync, processing...');
                          
                          // On web, we get access_token; on native, we get id_token
                          const idToken = result.params?.id_token || 
                                         result.params?.idToken || 
                                         result.authentication?.idToken;
                          const accessToken = result.params?.access_token ||
                                            result.authentication?.accessToken;
                          
                          // Prevent double processing if useEffect is also handling it
                          if (isProcessingGoogleAuth) {
                            console.log('Already processing Google auth, skipping...');
                            setGoogleLoading(false);
                            return;
                          }

                          if (idToken) {
                            await handleGoogleSignIn(idToken, 'idToken');
                          } else if (accessToken) {
                            // Web flow: use access_token
                            await handleGoogleSignIn(accessToken, 'accessToken');
                          } else {
                            console.error('❌ No token in promptAsync result:', result);
                            setError('Google sign-in failed: No token received');
                            setGoogleLoading(false);
                          }
                        } else if (result?.type === 'error') {
                          console.error('❌ Error from promptAsync:', result);
                          const errorMsg = result.error?.message || 'Google sign-in failed';
                          setError(errorMsg);
                          setGoogleLoading(false);
                          Alert.alert('Google Sign-In Failed', errorMsg);
                        } else if (result?.type === 'dismiss') {
                          console.log('👋 User dismissed');
                          setGoogleLoading(false);
                        } else {
                          console.log('⚠️ Unknown result type, waiting for response state...', result);
                          // Response might be handled by useEffect, so don't set loading to false yet
                        }
                      } catch (error: any) {
                        console.error('❌ Error calling promptAsync:', error);
                        setError(error?.message || 'Failed to open Google sign-in');
                        setGoogleLoading(false);
                        Alert.alert('Error', error?.message || 'Failed to open Google sign-in');
                      }
                    }
                  }}
                  style={styles.googleButton}
                  disabled={googleLoading || !promptAsync}
                >
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  onPress={toggleAuthMode}
                  style={styles.toggleContainer}
                >
                  <Text style={styles.toggleText}>
                    {isSignUp ? (
                      <>
                        Already have an account?{' '}
                        <Text style={styles.toggleLink}>Sign in</Text>
                      </>
                    ) : (
                      <>
                        New here?{' '}
                        <Text style={styles.toggleLink}>Create an account</Text>
                      </>
                    )}
                  </Text>
                </TouchableOpacity>

                <View style={styles.demoContainer}>
                  <Button
                    onPress={() => onNavigate?.('dashboard')}
                    variant="outline"
                    fullWidth
                    style={styles.demoButton}
                  >
                    Try demo without signing in
                  </Button>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any, isDesktopView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      flexDirection: isDesktopView ? 'row' : 'column',
      minHeight: '100%',
    },
    leftPanel: {
      flex: 1,
      maxWidth: isDesktopView ? '50%' : '100%',
      backgroundColor: '#0f172a', // slate-900
      position: 'relative',
      overflow: 'hidden',
    },
    leftPanelGradient: {
      flex: 1,
      padding: theme.spacing[16],
      justifyContent: 'center',
      position: 'relative',
    },
    blurEffects: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.2,
    },
    blurCircle1: {
      position: 'absolute',
      top: 80,
      left: 80,
      width: 256,
      height: 256,
      borderRadius: 128,
      backgroundColor: '#14b8a6', // teal-500
      ...Platform.select({
        web: {
          filter: 'blur(80px)',
        },
      }),
    },
    blurCircle2: {
      position: 'absolute',
      bottom: 80,
      right: 80,
      width: 384,
      height: 384,
      borderRadius: 192,
      backgroundColor: '#06b6d4', // cyan-500
      ...Platform.select({
        web: {
          filter: 'blur(80px)',
        },
      }),
    },
    leftPanelContent: {
      maxWidth: 500,
      position: 'relative',
      zIndex: 10,
      paddingLeft: 20,
    },
    leftPanelLogo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[8],
    },
    leftPanelLogoIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftPanelLogoText: {
      ...theme.typography.h2,
      fontSize: theme.fontSizes['3xl'],
      fontWeight: theme.fontWeights.bold,
      color: '#ffffff',
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    },
    leftPanelTitle: {
      ...theme.typography.h1Hero,
      fontSize: 36,
      fontWeight: theme.fontWeights.extraBold,
      color: '#ffffff',
      marginBottom: theme.spacing[4],
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    },
    leftPanelDescription: {
      ...theme.typography.bodyLarge,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: theme.spacing[12],
      fontSize: theme.fontSizes.lg,
      lineHeight: 28,
      maxWidth: 400,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[6],
      marginTop: theme.spacing[12],
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: 48,
      backgroundColor: '#334155', // slate-700
      marginRight: theme.spacing[6],
    },
    statContent: {
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.h1,
      fontSize: theme.fontSizes['3xl'],
      fontWeight: theme.fontWeights.extraBold,
      color: '#11B8A7',
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    },
    statLabel: {
      ...theme.typography.bodySmall,
      fontSize: theme.fontSizes.sm,
      color: '#94a3b8', // slate-400
      marginTop: theme.spacing[1],
    },
    rightPanel: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing[8],
      position: 'relative',
    },
    themeToggleContainer: {
      position: 'absolute',
      top: theme.spacing[4],
      right: theme.spacing[4],
      zIndex: 10,
    },
    formContainer: {
      width: '100%',
      maxWidth: 448,
    },
    mobileLogoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing[8],
    },
    mobileLogo: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.cardLarge,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    mobileLogoText: {
      ...theme.typography.h2,
      fontSize: theme.fontSizes['2xl'],
      color: theme.colors.accent,
      marginBottom: theme.spacing[1],
    },
    mobileTagline: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
    },
    desktopTitleContainer: {
      marginBottom: theme.spacing[8],
    },
    desktopTitle: {
      ...theme.typography.h1,
      fontSize: theme.fontSizes['3xl'],
      color: theme.colors.foreground,
      marginBottom: theme.spacing[2],
    },
    desktopSubtitle: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
    },
    form: {
      gap: theme.spacing[5],
    },
    inputGroup: {
      marginBottom: theme.spacing[1],
    },
    buttonContainer: {
      marginTop: theme.spacing[2],
    },
    submitButton: {
      borderRadius: theme.borderRadius.button,
      overflow: 'hidden',
      height: 48,
    },
    submitButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      height: 48,
      paddingHorizontal: theme.spacing[6],
    },
    submitButtonText: {
      ...theme.typography.button,
      color: theme.colors.primaryForeground,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    },
    toggleContainer: {
      marginTop: theme.spacing[6],
      alignItems: 'center',
    },
    toggleText: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
    },
    toggleLink: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeights.medium,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing[4],
      gap: theme.spacing[2],
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      ...theme.typography.bodySmall,
      color: theme.colors.mutedForeground,
      paddingHorizontal: theme.spacing[2],
    },
    googleButton: {
      borderRadius: theme.borderRadius.button,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[6],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[2],
    },
    googleButtonText: {
      ...theme.typography.button,
      color: theme.colors.foreground,
      fontWeight: theme.fontWeights.medium,
    },
    demoContainer: {
      marginTop: theme.spacing[8],
      paddingTop: theme.spacing[8],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    demoButton: {
      height: 48,
    },
    errorContainer: {
      marginTop: theme.spacing[2],
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.destructive,
      borderWidth: 1,
      borderColor: theme.colors.destructive,
    },
    errorText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontSize: theme.fontSizes.sm,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
  });
