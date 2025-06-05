import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Button } from 'react-native';
import { Drawer, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const sections = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home-outline',
    sub: [],
    screenName: 'Dashboard'
  },
  {
    key: 'content',
    label: 'Content',
    icon: 'tv-outline',
    sub: [
      { key: 'series', label: 'Series List', icon: 'list-outline' },
      { key: 'seasons', label: 'Seasons', icon: 'albums-outline' },
      { key: 'episodes', label: 'Episodes', icon: 'film-outline' },
    ],
    screenName: 'ContentManagement'
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'people-outline',
    sub: [],
    screenName: 'Users'
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'bar-chart-outline',
    sub: [],
    screenName: 'Analytics'
  },
  {
    key: 'publishing',
    label: 'Publishing',
    icon: 'calendar-outline',
    sub: [
      { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
    ],
    screenName: 'Publishing'
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: 'logo-usd',
    sub: [],
    screenName: 'Payments'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    sub: [],
    screenName: 'Settings'
  },
];

const Sidebar = ({ navigation, activeSection, onSectionChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState({});

  const handleSectionPress = (section) => {
    console.log(`Sidebar section clicked: ${section.key}, screenName: ${section.screenName}`);
    
    // Toggle expanded state for this section
    setExpanded((prev) => ({ ...prev, [section.key]: !prev[section.key] }));
    
    // Call the parent component's onSectionChange if provided
    if (onSectionChange) {
      console.log(`Calling onSectionChange with: ${section.key}`);
      onSectionChange(section.key);
    }
    
    // If this section has a screenName, navigate to that screen
    if (section.screenName) {
      console.log(`Navigating to screen: ${section.screenName}`);
      try {
        navigation.navigate(section.screenName);
      } catch (error) {
        console.error(`Error navigating to ${section.screenName}:`, error);
      }
    }
  };

  const handleDirectNavigate = (screenName) => {
    console.log(`Direct navigation to ${screenName} screen`);
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
    }
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.collapsed]}>
      <View style={styles.toggleRow}>
        <IconButton
          icon={collapsed ? 'chevron-right' : 'chevron-left'}
          size={24}
          onPress={() => setCollapsed((c) => !c)}
          style={styles.toggleBtn}
        />
      </View>
      
      {/* Emergency direct navigation buttons */}
      <View style={styles.emergencyNav}>
        <TouchableOpacity
          style={[styles.directNavButton, styles.dashboardButton]}
          onPress={() => handleDirectNavigate('Dashboard')}
        >
          <Text style={styles.directNavText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.directNavButton}
          onPress={() => handleDirectNavigate('Users')}
        >
          <Text style={styles.directNavText}>Users Direct</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.directNavButton, styles.analyticsButton]}
          onPress={() => handleDirectNavigate('Analytics')}
        >
          <Text style={styles.directNavText}>Analytics Direct</Text>
        </TouchableOpacity>
      </View>
      
      <Drawer.Section style={styles.drawerSection}>
        {sections.map((section) => (
          <View key={section.key}>
            <Drawer.Item
              label={collapsed ? undefined : section.label}
              icon={({ color, size }) => (
                <Ionicons name={section.icon} size={size} color={color} />
              )}
              active={activeSection === section.key}
              onPress={() => handleSectionPress(section)}
              style={activeSection === section.key ? styles.activeItem : null}
              testID={`section-${section.key}`}
            />
            {section.sub.length > 0 && expanded[section.key] && !collapsed && (
              <View style={styles.subSection}>
                {section.sub.map((sub) => (
                  <TouchableOpacity
                    key={sub.key}
                    style={styles.subItem}
                    onPress={() => {
                      console.log(`Subsection clicked: ${sub.key}`);
                      onSectionChange(sub.key);
                      
                      // Navigate based on subsection key
                      if (sub.key === 'series') navigation.navigate('Series');
                      if (sub.key === 'seasons') navigation.navigate('Seasons');
                      if (sub.key === 'episodes') navigation.navigate('Episodes');
                      if (sub.key === 'notifications') navigation.navigate('Notifications');
                    }}
                  >
                    <Ionicons name={sub.icon} size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={styles.subLabel}>{sub.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </Drawer.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: theme.colors.backgroundLight,
    paddingTop: theme.spacing.large,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100%',
  },
  collapsed: {
    width: 64,
  },
  toggleRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: theme.spacing.medium,
  },
  toggleBtn: {
    margin: 0,
  },
  drawerSection: {
    flex: 1,
  },
  activeItem: {
    backgroundColor: theme.colors.primary + '22',
  },
  subSection: {
    paddingLeft: 32,
    marginBottom: 8,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
  },
  emergencyNav: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  directNavButton: {
    backgroundColor: '#e60000',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 5,
  },
  analyticsButton: {
    backgroundColor: '#ff6600',
  },
  dashboardButton: {
    backgroundColor: '#007bff',
  },
  directNavText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default Sidebar; 
