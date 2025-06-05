import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Divider, Input } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  const handleNew = () => {
    navigation.navigate('NotificationAdd');
  };

  return (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Manage all notifications</Text>

      <View style={styles.actionBar}>
        <Button
          title="+ New Notification"
          icon={<Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 5 }} />}
          buttonStyle={styles.createButton}
          onPress={handleNew}
        />
      </View>

      <View style={styles.toolbar}>
        <Input
          placeholder="Search"
          containerStyle={styles.searchInput}
          leftIcon={<Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Type</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Audience</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Date Range</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Title</Text>
        <Text style={styles.headerCell}>Type</Text>
        <Text style={styles.headerCell}>Audience</Text>
        <Text style={styles.headerCell}>Schedule</Text>
        <Text style={styles.headerCell}>Status</Text>
        <Text style={styles.headerCell}>Next Run</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>

      {notifications.length === 0 && (
        <Text style={styles.emptyText}>No notifications created yet.</Text>
      )}
    </ScrollView>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('publishing');
  const { isDarkMode, toggleTheme, theme: currentTheme } =
    useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: theme };

  useEffect(() => {
    console.log('NotificationsScreen mounted');
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
        <NotificationsContent />
      </View>
    </View>
  );
};

const NotificationsScreenWithTheme = (props) => (
  <ThemeProvider>
    <NotificationsScreen {...props} />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: { flex: 1, height: '100%' },
  body: { flex: 1, flexDirection: 'row' },
  contentContainer: { flex: 1, padding: theme.spacing.large },
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  searchInput: { flex: 1, marginRight: theme.spacing.small, paddingVertical: 0 },
  filterButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
  },
  filterText: { color: theme.colors.text },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerCell: { flex: 1, fontWeight: 'bold', color: theme.colors.text },
  emptyText: {
    padding: theme.spacing.large,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NotificationsScreenWithTheme; 
