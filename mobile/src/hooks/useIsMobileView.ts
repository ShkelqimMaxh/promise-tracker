/**
 * useIsMobileView - Responsive layout by window size, not just platform.
 *
 * - On native (ios/android): always mobile view.
 * - On web: mobile view when width < BREAKPOINT, desktop view when >= BREAKPOINT.
 *
 * Use isMobileView / isDesktopView instead of Platform.OS === 'web' for layout,
 * so a narrow browser window gets the mobile UI and a wide one gets the desktop UI.
 */

import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

export const BREAKPOINT = 768;

export function useIsMobileView(): {
  isMobileView: boolean;
  isDesktopView: boolean;
  width: number;
} {
  const [width, setWidth] = useState(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return 0;
    return window.innerWidth;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (Platform.OS !== 'web') {
    return {
      isMobileView: true,
      isDesktopView: false,
      width: Dimensions.get('window').width,
    };
  }

  return {
    isMobileView: width < BREAKPOINT,
    isDesktopView: width >= BREAKPOINT,
    width,
  };
}
