import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Icon, IconNames } from '../components/common/Icons';
import TabBarIcon from '../components/common/TabBarIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreenNew';
import WebSeriesScreen from '../screens/main/WebSeriesScreen';
import WebSeriesDetailScreen from '../screens/main/WebSeriesDetailScreen';
import UpcomingScreen from '../screens/main/UpcomingScreen';

// Import content screens
import ContentDetailsScreen from '../screens/content/ContentDetailsScreen';
import VideoPlayerScreen from '../screens/content/VideoPlayerScreen';
import EpisodesScreen from '../screens/content/EpisodesScreen';
import CastCrewScreen from '../screens/content/CastCrewScreen';

// Import profile screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import PaymentMethodScreen from '../screens/profile/PaymentMethodScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import PaymentStatusScreen from '../screens/profile/PaymentStatusScreen';
import ManageDevicesScreen from '../screens/profile/ManageDevicesScreen';
import WatchlistScreen from '../screens/profile/WatchlistScreen';
import NotificationScreen from '../screens/profile/NotificationScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import RefundPolicyScreen from '../screens/profile/RefundPolicyScreen';
import TermsAndConditionsScreen from '../screens/profile/TermsAndConditionsScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import ManageSubscriptionScreen from '../screens/profile/ManageSubscriptionScreen';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminSubscriptionsScreen from '../screens/admin/AdminSubscriptionsScreen';

// Import theme
import theme from '../theme';

// Auth context
import { useAuth } from '../context/AuthProvider';
import { useSubscription } from '../context/SubscriptionProvider';
import { supabase } from '../lib/supabaseClient';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => {
  const { isSubscribed, isRouteAccessible } = useSubscription();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="ContentDetails" 
        component={ContentDetailsScreen} 
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          beforeRemove: (e) => {
            // Allow navigation if user is subscribed or the route is accessible
            if (isSubscribed || isRouteAccessible('ContentDetailsScreen')) {
              return;
            }
            
            // Prevent default behavior
            e.preventDefault();
            
            // Prompt the user to subscribe
            Alert.alert(
              'सब्सक्रिप्शन आवश्यक है',
              'इस सामग्री को देखने के लिए एक सक्रिय सदस्यता की आवश्यकता है। क्या आप सदस्यता योजनाओं को देखना चाहेंगे?',
              [
                { 
                  text: 'नहीं', 
                  style: 'cancel',
                  onPress: () => navigation.navigate('HomeMain')
                },
                { 
                  text: 'हां', 
                  onPress: () => navigation.navigate('ProfileStack', { screen: 'Subscription' })
                }
              ]
            );
          }
        })}
      />
      <Stack.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen}
        options={{ headerShown: false, gestureEnabled: false }}
        listeners={({ navigation }) => ({
          beforeRemove: (e) => {
            if (isSubscribed || isRouteAccessible('VideoPlayerScreen')) {
              return;
            }
            
            e.preventDefault();
            
            Alert.alert(
              'सब्सक्रिप्शन आवश्यक है',
              'इस वीडियो को देखने के लिए एक सक्रिय सदस्यता की आवश्यकता है। क्या आप सदस्यता योजनाओं को देखना चाहेंगे?',
              [
                { 
                  text: 'नहीं', 
                  style: 'cancel',
                  onPress: () => navigation.navigate('HomeMain')
                },
                { 
                  text: 'हां', 
                  onPress: () => navigation.navigate('ProfileStack', { screen: 'Subscription' })
                }
              ]
            );
          }
        })}
      />
      <Stack.Screen name="Episodes" component={EpisodesScreen} />
      <Stack.Screen name="CastCrew" component={CastCrewScreen} />
    </Stack.Navigator>
  );
};

// Upcoming Stack
const UpcomingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="UpcomingMain" component={UpcomingScreen} />
      <Stack.Screen name="WebSeriesDetail" component={WebSeriesDetailScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="Episodes" component={EpisodesScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CastCrew" component={CastCrewScreen} />
    </Stack.Navigator>
  );
};

// Web Series Stack
const WebSeriesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="WebSeriesMain" component={WebSeriesScreen} />
      <Stack.Screen name="WebSeriesDetail" component={WebSeriesDetailScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="Episodes" component={EpisodesScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CastCrew" component={CastCrewScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
      <Stack.Screen name="ManageDevices" component={ManageDevicesScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
      <Stack.Screen name="TermsConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
      
      {/* Admin Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} />
    </Stack.Navigator>
  );
};

// Helper to hide tab bar on VideoPlayer screen
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  return routeName === 'VideoPlayer' ? 'none' : 'flex';
};

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  // Check if user is admin
  useEffect(() => {
    if (user) {
      const checkAdminStatus = async () => {
        try {
          // Check if supabase is properly initialized
          if (!supabase || typeof supabase.from !== 'function') {
            console.error('Supabase client not properly initialized');
            return;
          }
          
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
          if (!error && data && data.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      };
      
      checkAdminStatus();
    }
  }, [user]);

  // Adjust tab bar height and padding for bottom safe area
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          display: getTabBarVisibility(route),
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.background,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let label = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === 'Upcoming') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            label = 'Upcoming';
          } else if (route.name === 'WebSeries') {
            iconName = focused ? 'tv' : 'tv-outline';
            label = 'Series';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            label = 'Profile';
          }
          
          return <TabBarIcon focused={focused} iconName={iconName} label={label} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Upcoming" component={UpcomingStack} />
      <Tab.Screen name="WebSeries" component={WebSeriesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={ProfileStack}
          initialParams={{ screen: 'AdminDashboard' }}
          options={{
            tabBarLabel: 'एडमिन',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="shield-account" color={color} size={size} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();
              // Navigate to the admin dashboard
              navigation.navigate('Profile', {
                screen: 'AdminDashboard',
              });
            },
          })}
        />
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  focusedIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconText: {
    color: theme.colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
  focusedText: {
    color: '#FFFFFF',
  },
  
  // Home icon
  homeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseBody: {
    width: 16,
    height: 12,
    backgroundColor: '#E50914',
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: '#E50914',
    position: 'absolute',
    top: 0,
  },
  
  // Calendar icon
  calendarIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
  },
  calendarTop: {
    width: 16,
    height: 4,
    backgroundColor: '#E50914',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarBody: {
    width: 16,
    height: 16,
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  
  // TV icon
  tvIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
  },
  tvScreen: {
    width: 18,
    height: 14,
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  tvStand: {
    width: 8,
    height: 6,
    backgroundColor: '#E50914',
    marginTop: 1,
  },
  
  // Profile icon
  profileIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
  },
  profileHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E50914',
  },
  profileBody: {
    width: 18,
    height: 10,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#E50914',
    marginTop: 2,
  },
});

export default MainNavigator; 
