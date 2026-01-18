# Required Dependencies for Dashboard

To run the Dashboard screen, you need to install the following packages:

## Install Commands

```bash
cd mobile
npm install expo-linear-gradient lucide-react-native
```

## Packages Needed

1. **expo-linear-gradient** - For gradient buttons and backgrounds
   ```bash
   npx expo install expo-linear-gradient
   ```

2. **lucide-react-native** - For icons (matches the web version's lucide-react)
   ```bash
   npm install lucide-react-native
   ```

## After Installation

After installing the dependencies, the Dashboard screen should work properly. The app will display:
- Header with logo and navigation
- Greeting section
- Stats cards (Trust Score, Current Streak, Completed)
- Filter tabs (All, Personal, Social)
- Promise cards list
- Empty state (when no promises match the filter)

## Note on Colors

The theme uses HSL color format which React Native supports natively. However, if you encounter any color issues, you may need to convert HSL to hex format using a color conversion utility.
