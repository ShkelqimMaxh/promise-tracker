import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Font from 'expo-font';

/**
 * Hook to load fonts (Inter and Plus Jakarta Sans) from Google Fonts CDN (web) or bundled fonts (native)
 * 
 * Display/Headings: Plus Jakarta Sans (weights 600, 700, 800)
 * Body/UI: Inter (weights 400, 500, 600, 700)
 * 
 * For web: Uses Google Fonts CDN
 * For native: Requires @expo/google-fonts packages
 *    Install: npm install @expo/google-fonts/inter @expo/google-fonts/plus-jakarta-sans
 */
export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        if (Platform.OS === 'web') {
          // For web, inject Google Fonts links from CDN
          if (typeof document !== 'undefined') {
            // Load Inter (Body/UI font)
            const interLink = document.querySelector('link[href*="fonts.googleapis.com"][href*="Inter"]');
            if (!interLink) {
              const link1 = document.createElement('link');
              link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
              link1.rel = 'stylesheet';
              document.head.appendChild(link1);
            }
            
            // Load Plus Jakarta Sans (Display/Headings font)
            const jakartaLink = document.querySelector('link[href*="fonts.googleapis.com"][href*="Plus+Jakarta+Sans"]');
            if (!jakartaLink) {
              const link2 = document.createElement('link');
              link2.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap';
              link2.rel = 'stylesheet';
              document.head.appendChild(link2);
            }
            
            // Wait a moment for the fonts to be available
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          setFontsLoaded(true);
        } else {
          // For native, try to load from @expo/google-fonts packages if available
          try {
            const fontMap: Record<string, any> = {};
            
            // Try to load Inter (Body/UI font)
            try {
              const interFonts = await import('@expo/google-fonts/inter');
              fontMap['Inter_400Regular'] = interFonts.Inter_400Regular;
              fontMap['Inter_500Medium'] = interFonts.Inter_500Medium;
              fontMap['Inter_600SemiBold'] = interFonts.Inter_600SemiBold;
              fontMap['Inter_700Bold'] = interFonts.Inter_700Bold;
            } catch (e) {
              console.log('Note: @expo/google-fonts/inter not installed');
            }
            
            // Try to load Plus Jakarta Sans (Display/Headings font)
            try {
              const jakartaFonts = await import('@expo/google-fonts/plus-jakarta-sans');
              fontMap['PlusJakartaSans_600SemiBold'] = jakartaFonts.PlusJakartaSans_600SemiBold;
              fontMap['PlusJakartaSans_700Bold'] = jakartaFonts.PlusJakartaSans_700Bold;
              fontMap['PlusJakartaSans_800ExtraBold'] = jakartaFonts.PlusJakartaSans_800ExtraBold;
            } catch (e) {
              console.log('Note: @expo/google-fonts/plus-jakarta-sans not installed');
            }
            
            if (Object.keys(fontMap).length > 0) {
              await Font.loadAsync(fontMap);
            }
            
            setFontsLoaded(true);
          } catch (importError) {
            // Packages not installed - app will use system fonts as fallback
            console.log('Note: @expo/google-fonts packages not installed. Install them for native font support.');
            setFontsLoaded(true); // Still continue so app works
          }
        }
      } catch (error) {
        console.warn('Font loading note (app will use fallback):', error);
        // Always set loaded so app can continue with fallback fonts
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}

// Legacy export name for backwards compatibility
export const useFrauncesFont = useFonts;
