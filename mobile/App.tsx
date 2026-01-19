// Import polyfills first to ensure they're available
import './src/polyfills';

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AchievementProvider } from './src/contexts/AchievementContext';
import { ToastProvider } from './src/components/ui/Toast';
import { AchievementPopup } from './src/components/AchievementPopup';
import Dashboard from './src/screens/Dashboard';
import SignIn from './src/screens/SignIn';
import Promises from './src/screens/Promises';
import CreatePromise from './src/screens/CreatePromise';
import PromiseDetail from './src/screens/PromiseDetail';
import Profile from './src/screens/Profile';
import { useFonts } from './src/utils/useFonts';

function AppContent() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const fontsLoaded = useFonts();
  
  // Get initial route from URL on web
  const getInitialRoute = (): string => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

  // Sync route with URL on web and handle auth-based redirects
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = () => {
        setCurrentRoute(window.location.pathname || '/');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading && !fontsLoaded) return;

    if (!isLoading && fontsLoaded) {
      const path = currentRoute;
      
      // Protected routes that require authentication
      const protectedRoutes = ['/promises', '/create', '/profile'];
      const isProtectedRoute = 
        protectedRoutes.some(route => path === route || path === `${route}/`) ||
        path.startsWith('/promise/');

      // If logged in and trying to access signin, redirect to promises
      if (isAuthenticated && (path === '/signin' || path === '/signin/')) {
        setCurrentRoute('/promises');
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.pushState({}, '', '/promises');
        }
        return;
      }

      // If not logged in and trying to access protected routes, redirect to signin
      if (!isAuthenticated && isProtectedRoute) {
        setCurrentRoute('/signin');
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.pushState({}, '', '/signin');
        }
        return;
      }

      // If logged in and trying to access non-protected routes (except signin), redirect to promises
      if (isAuthenticated && (path === '/' || path === '/dashboard')) {
        setCurrentRoute('/promises');
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.pushState({}, '', '/promises');
        }
      }
    }
  }, [isAuthenticated, isLoading, fontsLoaded, currentRoute]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const handleNavigate = (route: string) => {
    // Handle logout
    if (route === 'logout') {
      // Will be handled by the component calling logout
      return;
    }

    setCurrentRoute(`/${route}`);
    
    // Update URL on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${route}`);
    }
  };

  // Route rendering
  if (currentRoute === '/signin' || currentRoute === '/signin/') {
    return (
      <>
        <SignIn onNavigate={handleNavigate} />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  if (currentRoute === '/promises' || currentRoute === '/promises/') {
    return (
      <>
        <Promises onNavigate={handleNavigate} />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  if (currentRoute === '/create' || currentRoute === '/create/') {
    // Only allow logged-in users to access create page
    if (!isAuthenticated) {
      // This should already be handled by the useEffect, but just in case
      return (
        <>
          <SignIn onNavigate={handleNavigate} />
          <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        </>
      );
    }
    return (
      <>
        <CreatePromise onNavigate={handleNavigate} />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  // Promise detail route (/promise/:id)
  if (currentRoute.startsWith('/promise/')) {
    if (!isAuthenticated) {
      return (
        <>
          <SignIn onNavigate={handleNavigate} />
          <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        </>
      );
    }
    const promiseId = currentRoute.replace('/promise/', '').replace('/', '');
    return (
      <>
        <PromiseDetail promiseId={promiseId} onNavigate={handleNavigate} />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  // Profile route
  if (currentRoute === '/profile' || currentRoute === '/profile/') {
    if (!isAuthenticated) {
      return (
        <>
          <SignIn onNavigate={handleNavigate} />
          <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        </>
      );
    }
    return (
      <>
        <Profile onNavigate={handleNavigate} />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }

  // Default to dashboard (landing page) for non-authenticated users
  return (
    <>
      <Dashboard onNavigate={handleNavigate} />
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider initialMode="auto">
        <AuthProvider>
          <AchievementProvider>
            <ToastProvider>
              <AppContent />
              <AchievementPopup />
            </ToastProvider>
          </AchievementProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
