import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Card, Button, Divider, Input } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';

const SettingItem = ({ icon, title, description, type, value, onValueChange, options }) => {
  const renderControl = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={value ? '#ffffff' : '#f4f3f4'}
          />
        );
      case 'select':
        return (
          <View style={styles.selectControl}>
            <Text style={styles.selectValue}>{value}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
          </View>
        );
      case 'navigation':
        return (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={type === 'navigation' ? onValueChange : undefined}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {renderControl()}
    </TouchableOpacity>
  );
};

const SettingsGroup = ({ title, children }) => (
  <View style={styles.settingsGroup}>
    <Text style={styles.settingsGroupTitle}>{title}</Text>
    <Card containerStyle={styles.card}>
      {children}
    </Card>
  </View>
);

const SettingsContent = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    analytics: true,
    language: 'English',
    region: 'Global',
    autoPlayVideos: true,
    quality: 'Automatic',
    subtitles: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNavigation = (screen) => {
    console.log(`Navigate to: ${screen}`);
    // In a real app, would navigate to detail screen
  };

  return (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.title}>Platform Settings</Text>
      <Text style={styles.subtitle}>Configure application settings and preferences</Text>
      
      <SettingsGroup title="Appearance">
        <SettingItem
          icon="contrast-outline"
          title="Dark Mode"
          description="Enable dark theme for better viewing in low light"
          type="toggle"
          value={settings.darkMode}
          onValueChange={(value) => updateSetting('darkMode', value)}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="color-palette-outline"
          title="Theme"
          description="Customize the application's color scheme"
          type="navigation"
          onValueChange={() => handleNavigation('ThemeSettings')}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="language-outline"
          title="Language"
          description="Choose your preferred language"
          type="select"
          value={settings.language}
          onValueChange={(value) => updateSetting('language', value)}
          options={['English', 'Spanish', 'French', 'German', 'Japanese']}
        />
      </SettingsGroup>
      
      <SettingsGroup title="Notifications">
        <SettingItem
          icon="mail-outline"
          title="Email Notifications"
          description="Receive updates via email"
          type="toggle"
          value={settings.emailNotifications}
          onValueChange={(value) => updateSetting('emailNotifications', value)}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          description="Receive updates on your device"
          type="toggle"
          value={settings.pushNotifications}
          onValueChange={(value) => updateSetting('pushNotifications', value)}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="newspaper-outline"
          title="Notification Templates"
          description="Customize notification messages"
          type="navigation"
          onValueChange={() => handleNavigation('NotificationTemplates')}
        />
      </SettingsGroup>
      
      <SettingsGroup title="Playback">
        <SettingItem
          icon="play-outline"
          title="Auto-Play Videos"
          description="Automatically play videos when browsing"
          type="toggle"
          value={settings.autoPlayVideos}
          onValueChange={(value) => updateSetting('autoPlayVideos', value)}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="speedometer-outline"
          title="Video Quality"
          description="Default quality for video playback"
          type="select"
          value={settings.quality}
          onValueChange={(value) => updateSetting('quality', value)}
          options={['Low', 'Medium', 'High', 'Automatic']}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="text-outline"
          title="Subtitles"
          description="Show subtitles when available"
          type="toggle"
          value={settings.subtitles}
          onValueChange={(value) => updateSetting('subtitles', value)}
        />
      </SettingsGroup>
      
      <SettingsGroup title="Advanced">
        <SettingItem
          icon="bar-chart-outline"
          title="Analytics"
          description="Help improve the platform by sharing usage data"
          type="toggle"
          value={settings.analytics}
          onValueChange={(value) => updateSetting('analytics', value)}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="globe-outline"
          title="Content Region"
          description="Set your content region preference"
          type="select"
          value={settings.region}
          onValueChange={(value) => updateSetting('region', value)}
          options={['Global', 'North America', 'Europe', 'Asia', 'Australia']}
        />
        <Divider style={styles.divider} />
        <SettingItem
          icon="trash-outline"
          title="Clear Cache"
          description="Free up space on your device"
          type="navigation"
          onValueChange={() => handleNavigation('ClearCache')}
        />
      </SettingsGroup>

      <View style={styles.buttonContainer}>
        <Button
          title="Save Changes"
          buttonStyle={styles.saveButton}
          icon={<Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 10 }} />}
        />
        <Button
          title="Reset to Defaults"
          type="outline"
          buttonStyle={styles.resetButton}
          titleStyle={{ color: theme.colors.textSecondary }}
        />
      </View>
    </ScrollView>
  );
};

const SettingsScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('settings');
  const { isDarkMode, toggleTheme, theme: currentTheme } = useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: theme };
  
  useEffect(() => {
    console.log('SettingsScreen mounted');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <HeaderBar
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationCount={0}
        onLogout={() => {}}
        onSettings={() => {}}
      />
      
      <View style={styles.body}>
        <Sidebar
          navigation={navigation}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <SettingsContent />
      </View>
    </View>
  );
};

// Wrap with ThemeProvider to ensure theme context is available
const SettingsScreenWithTheme = (props) => (
  <ThemeProvider>
    <SettingsScreen {...props} />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.large,
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large,
  },
  settingsGroup: {
    marginBottom: theme.spacing.large,
  },
  settingsGroupTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    marginLeft: theme.spacing.small,
  },
  card: {
    padding: 0,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.backgroundElevated,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginVertical: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.medium,
  },
  settingItemContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  selectControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginRight: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.large,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
  },
  resetButton: {
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
  },
});

export default SettingsScreenWithTheme; 
