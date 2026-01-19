/**
 * Achievement Context
 * Tracks user achievements and displays celebration popups
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storage } from '../utils/storage';

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt?: string;
  category: 'promise' | 'milestone' | 'streak' | 'social';
}

// Dynamic achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'id' | 'unlockedAt'>> = {
  // Promise achievements
  first_promise: {
    title: 'Promise Maker',
    description: 'Created your first promise',
    icon: '🎯',
    category: 'promise',
  },
  five_promises: {
    title: 'Committed',
    description: 'Created 5 promises',
    icon: '📝',
    category: 'promise',
  },
  ten_promises: {
    title: 'Promise Champion',
    description: 'Created 10 promises',
    icon: '🏆',
    category: 'promise',
  },
  twenty_five_promises: {
    title: 'Promise Master',
    description: 'Created 25 promises',
    icon: '👑',
    category: 'promise',
  },

  // Completion achievements
  first_completed: {
    title: 'Promise Keeper',
    description: 'Completed your first promise',
    icon: '✅',
    category: 'promise',
  },
  five_completed: {
    title: 'Reliable',
    description: 'Completed 5 promises',
    icon: '💪',
    category: 'promise',
  },
  ten_completed: {
    title: 'Trustworthy',
    description: 'Completed 10 promises',
    icon: '🌟',
    category: 'promise',
  },
  perfect_month: {
    title: 'Perfect Month',
    description: 'Completed all promises in a month',
    icon: '📅',
    category: 'promise',
  },

  // Milestone achievements
  first_milestone: {
    title: 'Step by Step',
    description: 'Completed your first milestone',
    icon: '🚶',
    category: 'milestone',
  },
  ten_milestones: {
    title: 'Progress Maker',
    description: 'Completed 10 milestones',
    icon: '📈',
    category: 'milestone',
  },
  fifty_milestones: {
    title: 'Milestone Master',
    description: 'Completed 50 milestones',
    icon: '🎖️',
    category: 'milestone',
  },

  // Streak achievements
  three_day_streak: {
    title: 'Getting Started',
    description: 'Maintained a 3-day streak',
    icon: '🔥',
    category: 'streak',
  },
  week_streak: {
    title: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    category: 'streak',
  },
  month_streak: {
    title: 'Monthly Master',
    description: 'Maintained a 30-day streak',
    icon: '💎',
    category: 'streak',
  },

  // Social achievements
  first_social_promise: {
    title: 'Social Butterfly',
    description: 'Made a promise to someone',
    icon: '🤝',
    category: 'social',
  },
  first_mentor: {
    title: 'Guided',
    description: 'Added a mentor to a promise',
    icon: '👨‍🏫',
    category: 'social',
  },
  five_social_completed: {
    title: 'Trust Builder',
    description: 'Completed 5 social promises',
    icon: '🏛️',
    category: 'social',
  },
};

interface AchievementContextType {
  achievements: Achievement[];
  pendingAchievement: Achievement | null;
  checkAndUnlockAchievement: (id: string) => Promise<boolean>;
  dismissAchievement: () => void;
  hasAchievement: (id: string) => boolean;
  getAchievementProgress: (category: string) => { unlocked: number; total: number };
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const ACHIEVEMENTS_STORAGE_KEY = '@promise_tracker:achievements';

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  // Load achievements from storage
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const stored = await getStoredAchievements();
        if (stored) {
          setAchievements(stored);
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };
    loadAchievements();
  }, []);

  // Process achievement queue
  useEffect(() => {
    if (!pendingAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setPendingAchievement(next);
      setAchievementQueue(rest);
    }
  }, [pendingAchievement, achievementQueue]);

  const getStoredAchievements = async (): Promise<Achievement[] | null> => {
    try {
      // Use the same storage pattern
      let AsyncStorage: any;
      try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (e) {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
          return stored ? JSON.parse(stored) : null;
        }
        return null;
      }
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get stored achievements:', error);
      return null;
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      let AsyncStorage: any;
      try {
        AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (e) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));
          return;
        }
        return;
      }
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  };

  const hasAchievement = useCallback((id: string): boolean => {
    return achievements.some((a) => a.id === id);
  }, [achievements]);

  const checkAndUnlockAchievement = async (id: string): Promise<boolean> => {
    // Check if already unlocked
    if (hasAchievement(id)) {
      return false;
    }

    // Check if valid achievement
    const definition = ACHIEVEMENT_DEFINITIONS[id];
    if (!definition) {
      console.warn(`Unknown achievement: ${id}`);
      return false;
    }

    // Create new achievement
    const newAchievement: Achievement = {
      id,
      ...definition,
      unlockedAt: new Date().toISOString(),
    };

    // Update state
    const updatedAchievements = [...achievements, newAchievement];
    setAchievements(updatedAchievements);
    await saveAchievements(updatedAchievements);

    // Queue the achievement for display
    setAchievementQueue((prev) => [...prev, newAchievement]);

    return true;
  };

  const dismissAchievement = () => {
    setPendingAchievement(null);
  };

  const getAchievementProgress = (category: string): { unlocked: number; total: number } => {
    const categoryAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS)
      .filter(([_, def]) => def.category === category);
    const unlocked = achievements.filter((a) => 
      ACHIEVEMENT_DEFINITIONS[a.id]?.category === category
    ).length;
    return { unlocked, total: categoryAchievements.length };
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        pendingAchievement,
        checkAndUnlockAchievement,
        dismissAchievement,
        hasAchievement,
        getAchievementProgress,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
