import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import theme from '../../theme';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';
import usersApi from '../../api/usersApi';

const UsersContent = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = usersApi.subscribeToUsers(setUsers);
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>User Management</Text>
      <Text style={styles.subtitle}>Manage platform users and permissions</Text>
      
      <View style={styles.actionBar}>
        <Button
          title="Add New User"
          icon={<Ionicons name="person-add-outline" size={20} color="white" style={{ marginRight: 5 }} />}
          buttonStyle={styles.addButton}
        />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
          <Text style={[styles.headerCell, { flex: 3 }]}>Email</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Role</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
        </View>
        {users.map((user) => (
          <View key={user.id} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{user.name}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{user.email}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{user.role}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>
              <View style={[styles.statusBadge, { backgroundColor: user.status === 'Active' ? '#4CAF50' : '#FFC107' }]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </Text>
            <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'space-around' }]}>  
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const UsersScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('users');
  const { isDarkMode, toggleTheme, theme: currentTheme } = useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: theme };
  
  useEffect(() => {
    console.log('UsersScreen mounted');
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
        <UsersContent />
      </View>
    </View>
  );
};

// Wrap with ThemeProvider to ensure theme context is available
const UsersScreenWithTheme = (props) => (
  <ThemeProvider>
    <UsersScreen {...props} />
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
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
  },
  scrollContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.bold,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  cell: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default UsersScreenWithTheme; 
