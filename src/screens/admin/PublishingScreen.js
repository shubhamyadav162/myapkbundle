import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';

const ScheduleItem = ({ title, time, status, type, onPress }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'scheduled': return '#4CAF50';
      case 'published': return '#2196F3';
      case 'draft': return '#FFC107';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.scheduleItem}>
      <View style={styles.scheduleLeft}>
        <Ionicons 
          name={type === 'series' ? 'tv-outline' : 'film-outline'} 
          size={24} 
          color={theme.colors.primary} 
        />
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleTitle}>{title}</Text>
          <Text style={styles.scheduleTime}>{time}</Text>
        </View>
      </View>
      <View style={styles.scheduleRight}>
        <Text style={[styles.scheduleStatus, { color: getStatusColor() }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const PublishingContent = () => {
  const [upcoming, setUpcoming] = useState([
    { id: 1, title: 'The Big Show Season 2', time: 'June 15, 2023 - 12:00 PM', status: 'scheduled', type: 'series' },
    { id: 2, title: 'Summer Special Episode', time: 'June 20, 2023 - 3:30 PM', status: 'draft', type: 'episode' },
    { id: 3, title: 'Behind the Scenes', time: 'June 25, 2023 - 5:00 PM', status: 'scheduled', type: 'episode' },
    { id: 4, title: 'Action Heroes Collection', time: 'July 1, 2023 - 9:00 AM', status: 'draft', type: 'series' },
  ]);
  
  const [recent, setRecent] = useState([
    { id: 5, title: 'The Big Show Season 1', time: 'May 10, 2023 - 12:00 PM', status: 'published', type: 'series' },
    { id: 6, title: 'Comedy Night Special', time: 'May 20, 2023 - 8:00 PM', status: 'published', type: 'episode' },
  ]);

  const handleItemPress = (item) => {
    console.log('Schedule item pressed:', item);
    // In a real app, would navigate to edit screen
  };

  const handleCreateSchedule = () => {
    console.log('Create new schedule');
    // In a real app, would navigate to creation screen
  };

  return (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.title}>Publishing Schedule</Text>
      <Text style={styles.subtitle}>Manage content release schedule</Text>
      
      <View style={styles.actionBar}>
        <Button
          title="Create New Schedule"
          icon={<Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 5 }} />}
          buttonStyle={styles.createButton}
          onPress={handleCreateSchedule}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Releases</Text>
        <Card containerStyle={styles.card}>
          {upcoming.length > 0 ? (
            upcoming.map((item, index) => (
              <React.Fragment key={item.id}>
                <ScheduleItem 
                  title={item.title} 
                  time={item.time} 
                  status={item.status} 
                  type={item.type}
                  onPress={() => handleItemPress(item)}
                />
                {index < upcoming.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming releases scheduled</Text>
          )}
        </Card>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Published</Text>
        <Card containerStyle={styles.card}>
          {recent.length > 0 ? (
            recent.map((item, index) => (
              <React.Fragment key={item.id}>
                <ScheduleItem 
                  title={item.title} 
                  time={item.time} 
                  status={item.status} 
                  type={item.type}
                  onPress={() => handleItemPress(item)}
                />
                {index < recent.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent publications</Text>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publishing Settings</Text>
        <Card containerStyle={styles.card}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Notification Templates</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Default Release Times</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Regional Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

const PublishingScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('publishing');
  const { isDarkMode, toggleTheme, theme: currentTheme } = useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: theme };
  
  useEffect(() => {
    console.log('PublishingScreen mounted');
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
        <PublishingContent />
      </View>
    </View>
  );
};

// Wrap with ThemeProvider to ensure theme context is available
const PublishingScreenWithTheme = (props) => (
  <ThemeProvider>
    <PublishingScreen {...props} />
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.large,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
  },
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
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
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleInfo: {
    marginLeft: theme.spacing.medium,
    flex: 1,
  },
  scheduleTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  scheduleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleStatus: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium,
    marginRight: theme.spacing.medium,
  },
  emptyText: {
    padding: theme.spacing.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  settingText: {
    flex: 1,
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
  },
});

export default PublishingScreenWithTheme; 
