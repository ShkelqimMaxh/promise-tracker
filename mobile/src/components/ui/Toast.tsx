/**
 * Toast Component
 * Simple toast notification for React Native
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CheckCircle2, X } from 'lucide-react-native';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onHide,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide animation after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, fadeAnim, slideAnim, onHide]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success || '#10B981';
      case 'error':
        return theme.colors.destructive || '#EF4444';
      case 'info':
        return theme.colors.primary || '#3B82F6';
      default:
        return theme.colors.success || '#10B981';
    }
  };

  const backgroundColor = getBackgroundColor();
  const styles = createStyles(theme, backgroundColor);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toast}>
        <CheckCircle2 size={20} color="#FFFFFF" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

interface ToastContainerProps {
  children: React.ReactNode;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  key: number;
}

const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}>({
  showToast: () => {},
});

export const ToastProvider: React.FC<ToastContainerProps> = ({ children }) => {
  const [toast, setToast] = React.useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      message,
      type,
      key: Date.now(),
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const createStyles = (theme: any, backgroundColor: string) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: Platform.OS === 'web' ? 20 : 60,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 9999,
      pointerEvents: 'box-none',
      ...Platform.select({
        web: {
          position: 'fixed',
        },
      }),
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderRadius: theme.borderRadius.lg,
      minWidth: 200,
      maxWidth: '90%',
      gap: theme.spacing[2],
      ...Platform.select({
        web: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      }),
    },
    message: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontWeight: theme.fontWeights.medium,
      flex: 1,
    },
  });
