import 'cross-fetch/polyfill';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StatusBar, LogBox, StyleSheet, Platform, Alert, Linking, Image, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as ElementsThemeProvider } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import LoadingScreen from './src/components/common/LoadingScreen';
import * as WebBrowser from 'expo-web-browser';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useFlipper } from '@react-navigation/devtools';
import { createStackNavigator } from '@react-navigation/stack';

// Supabase initialization - Ensure this is imported properly
import { supabase } from './src/lib/supabaseClient';

// Import AuthProvider instead of AuthContext
import { AuthProvider, useAuth } from './src/context/AuthProvider';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { theme } from './src/theme';
import * as NavigationBar from 'expo-navigation-bar';
import { SubscriptionProvider } from './src/context/SubscriptionProvider';

// Suppress warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'WebChannelConnection RPC',
  '[expo-av]',
]);

// Complete any pending OAuth sessions
WebBrowser.maybeCompleteAuthSession();

// Get proper config based on Expo SDK version
const getExpoConfig = () => {
  // For Expo SDK 46 and above
  if (Constants.expoConfig) {
    return Constants.expoConfig;
  }
  
  // For Expo SDK 45 and below
  return Constants.manifest;
};

// Function to cache images
const cacheImages = async (images) => {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

// Function to load fonts
const cacheFonts = async (fonts) => {
  return fonts.map(font => Font.loadAsync(font));
};

const Stack = createStackNavigator();

const App = () => {
  // Prevent splash screen from auto-hiding
  SplashScreen.preventAutoHideAsync();
  const [isReady, setIsReady] = useState(false);
  const isWeb = Platform.OS === 'web';
  const [userToken, setUserToken] = useState(null);
  const navigationRef = useRef();
  
  // Handle deep linking
  const handleDeepLink = useCallback((url) => {
    if (!url) return;
    
    console.log('Deep link URL:', url);
    
    // Parse URL
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname?.split('/') || [];
    
    // Handle payment callback
    if (parsedUrl.host === 'payment-callback') {
      const transactionId = parsedUrl.searchParams.get('transaction_id');
      const status = parsedUrl.searchParams.get('status');
      
      console.log('Payment callback:', { transactionId, status });
      
      // Navigate to payment status screen
      if (navigationRef.current && transactionId) {
        navigationRef.current.navigate('PaymentStatus', { 
          transactionId,
          status
        });
      }
    }
  }, [navigationRef]);
  
  // Set up deep link handler on component mount
  useEffect(() => {
    // Handle incoming links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    // Handle case where app is opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  // Set navigation bar color to black
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync('black').catch(e => {
          // Silently handle errors that might occur on non-Android platforms
        });
        NavigationBar.setButtonStyleAsync('light').catch(e => {
          // Silently handle errors that might occur on non-Android platforms
        });
        NavigationBar.setBorderColorAsync('black').catch(e => {
          // Silently handle errors that might occur on non-Android platforms
        });
      } catch (error) {
        // Catch any other errors with navigation bar
        console.log('Navigation bar API error:', error);
      }
    }
  }, []);

  // Prepare resources and hide splash screen when ready
  useEffect(() => {
    async function prepare() {
      try {
        // Cache splash image
        await Asset.fromModule(require('./assets/mainlogoo.png')).downloadAsync();
        // Load fonts
        await Font.loadAsync({
          // Load any custom fonts here
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  // Monitor Supabase auth state changes
  useEffect(() => {
    try {
      // Safe access to Supabase auth
      if (!supabase || !supabase.auth) {
        console.warn('Supabase client not properly initialized');
        return () => {};
      }
      
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session?.user) {
            const token = session.user.id;
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
          } else {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      });
      
      return () => {
        if (data?.subscription) {
          data.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Failed to set up auth state change listener:', error);
      return () => {};
    }
  }, []);

  // Don't render app until splash is hidden
  if (!isReady) {
    return (
      <View style={styles.splashOverlay}>
        <Image
          source={require('./assets/mainlogoo.png')}
          style={styles.splashImage}
        />
      </View>
    );
  }

  const linking = {
    prefixes: ['com.bigshow.app://', 'https://bigshow.com', 'bigshow://'],
    config: {
      screens: {
        PaymentStatus: {
          path: 'payment-callback',
          parse: {
            transactionId: (transactionId) => transactionId,
            status: (status) => status
          }
        }
      }
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ElementsThemeProvider theme={theme}>
          <StatusBar translucent={false} barStyle="light-content" backgroundColor={theme.colors.primary} />
          <AuthProvider>
            <SubscriptionProvider>
              <NavigationContainer 
                ref={navigationRef}
                linking={linking}
              >
                <AppNavigator />
              </NavigationContainer>
            </SubscriptionProvider>
          </AuthProvider>
        </ElementsThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

// Main app navigator that handles auth state
function AppNavigator() {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // Auth screens
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Main app screens with subscription check
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  splashImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorSubText: { color: '#BBBBBB', fontSize: 14, textAlign: 'center' },
});

export default App; 
