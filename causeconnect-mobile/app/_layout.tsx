import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as BootSplash from 'react-native-bootsplash';
import * as Font from 'expo-font';
import { Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import "./main.css"
import { Auth0Provider } from 'react-native-auth0';

import { useColorScheme } from '@/components/useColorScheme';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  const [appReady, setAppReady] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    async function prepare() {
      await Font.loadAsync({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Poppins_700Bold,
        ...FontAwesome.font
      });

      setAppReady(true);
    }
    prepare()
  }, [])

  useEffect(() => {
    if (!appReady) return;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true})
    ]).start(async () => {
      await BootSplash.hide({ fade: true });
    });

  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return <RootLayoutNav fadeAnim = {fadeAnim} scaleAnim={scaleAnim}/>;
}

interface RootLayoutNavProps {
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

function RootLayoutNav(props: RootLayoutNavProps) {
  const colorScheme = useColorScheme();

  const fadeAnim = props.fadeAnim;
  const scaleAnim = props.scaleAnim;

  return (
    <Animated.View style={{
      flex: 1,
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }]
    }}>
      <Auth0Provider domain = "dev-zczlap588q6otywu.au.auth0.com" clientId = "bI8V73uWqe8dEuxHvrzmLiOdgFHWD9Rf">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </Auth0Provider>
    </Animated.View>
  );
}
