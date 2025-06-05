import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import DashboardScreenWithTheme from '../screens/admin/DashboardScreen';
import SeriesScreen from '../screens/admin/SeriesScreen';
import SeriesAddScreen from '../screens/admin/SeriesAddScreen';
import SeriesEditScreen from '../screens/admin/SeriesEditScreen';
import EpisodesScreen from '../screens/admin/EpisodesScreen';
import EpisodeAddScreen from '../screens/admin/EpisodeAddScreen';
import EpisodeEditScreen from '../screens/admin/EpisodeEditScreen';
import UsersScreenWithTheme from '../screens/admin/UsersScreen';
import AnalyticsScreenWithTheme from '../screens/admin/AnalyticsScreen';
import PublishingScreenWithTheme from '../screens/admin/PublishingScreen';
import SettingsScreenWithTheme from '../screens/admin/SettingsScreen';
import NotificationsScreenWithTheme from '../screens/admin/NotificationsScreen';
import NotificationAddScreen from '../screens/admin/NotificationAddScreen';
import ContentManagementScreenWithTheme from '../screens/admin/ContentManagementScreen';
import SeriesManagementScreenWithTheme from '../screens/admin/SeriesManagementScreen';
import EpisodeManagementScreenWithTheme from '../screens/admin/EpisodeManagementScreen';
import PaymentManagementScreen from '../screens/admin/PaymentManagementScreen';
import PaymentMethodsScreen from '../screens/admin/PaymentMethodsScreen.js';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  console.log('AdminNavigator rendering, with UsersScreen:', !!UsersScreenWithTheme, 'AnalyticsScreen:', !!AnalyticsScreenWithTheme, 'PublishingScreen:', !!PublishingScreenWithTheme, 'SettingsScreen:', !!SettingsScreenWithTheme);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreenWithTheme} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="ContentManagement" component={ContentManagementScreenWithTheme} options={{ title: 'Content Management' }} />
      <Stack.Screen name="Series" component={SeriesManagementScreenWithTheme} options={{ title: 'Series Management' }} />
      <Stack.Screen name="SeriesAdd" component={SeriesAddScreen} options={{ title: 'Add Series' }} />
      <Stack.Screen name="SeriesEdit" component={SeriesEditScreen} options={{ title: 'Edit Series' }} />
      <Stack.Screen name="Episodes" component={EpisodeManagementScreenWithTheme} options={{ title: 'Episodes Management' }} />
      <Stack.Screen name="EpisodeAdd" component={EpisodeAddScreen} options={{ title: 'Add Episode' }} />
      <Stack.Screen name="EpisodeEdit" component={EpisodeEditScreen} options={{ title: 'Edit Episode' }} />
      <Stack.Screen 
        name="Users" 
        component={UsersScreenWithTheme} 
        options={{ title: 'User Management' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreenWithTheme} 
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="Publishing" 
        component={PublishingScreenWithTheme} 
        options={{ title: 'Publishing' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreenWithTheme} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="NotificationAdd"
        component={NotificationAddScreen}
        options={{ title: 'New Notification' }}
      />
      <Stack.Screen
        name="Payments"
        component={PaymentManagementScreen}
        options={{ title: 'Payment Management' }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: 'Payment Methods' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreenWithTheme} 
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbbbbb',
    textAlign: 'center',
  }
});

export default AdminNavigator; 
