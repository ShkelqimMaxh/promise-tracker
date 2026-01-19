/**
 * Theme Provider - Context provider for theme management
 * Allows switching between light and dark themes throughout the app
 * Supports system preference with manual override
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeMode, lightTheme, darkTheme } from './index';
import { storage } from '../utils/storage';

export type ThemePreference = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setPreference: (preference: ThemePreference) => void;
  cycleTheme: () => void; // Cycles through: auto -> light -> dark -> auto
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode | 'auto';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialMode = 'auto' 
}) => {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(
    initialMode === 'auto' ? 'auto' : initialMode
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute effective mode based on preference and system color scheme
  const getEffectiveMode = (pref: ThemePreference): ThemeMode => {
    if (pref === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return pref;
  };

  const [mode, setMode] = useState<ThemeMode>(() => getEffectiveMode(preference));

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const savedPreference = await storage.getThemePreference();
        if (savedPreference) {
          setPreferenceState(savedPreference);
          setMode(getEffectiveMode(savedPreference));
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreference();
  }, []);

  // Update mode when system color scheme changes (only if in auto mode)
  useEffect(() => {
    if (preference === 'auto' && systemColorScheme) {
      setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, preference]);

  const setPreference = async (newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    setMode(getEffectiveMode(newPreference));
    try {
      await storage.setThemePreference(newPreference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setPreferenceState(newMode);
    setMode(newMode);
    storage.setThemePreference(newMode).catch(console.error);
  };

  const cycleTheme = () => {
    // Cycle: auto -> light -> dark -> auto
    let newPreference: ThemePreference;
    if (preference === 'auto') {
      newPreference = 'light';
    } else if (preference === 'light') {
      newPreference = 'dark';
    } else {
      newPreference = 'auto';
    }
    setPreference(newPreference);
  };

  const setTheme = (newMode: ThemeMode) => {
    setPreferenceState(newMode);
    setMode(newMode);
    storage.setThemePreference(newMode).catch(console.error);
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, preference, toggleTheme, setTheme, setPreference, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme in components
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to get just the theme object
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};
