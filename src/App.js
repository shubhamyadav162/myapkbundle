import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './components/common/ThemeProvider';
import Sidebar from './components/common/Sidebar';
import HeaderBar from './components/common/HeaderBar';
import { ToastContainer } from './components/common/Toast';
import AdminNavigator from './navigation/AdminNavigator';

const DashboardLayout = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [activeSection, setActiveSection] = React.useState('dashboard');

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>  
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <View style={styles.mainArea}>
        <HeaderBar
          onToggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          notificationCount={3}
          onLogout={() => {}}
          onSettings={() => {}}
        />
        <View style={styles.contentArea}>
          <AdminNavigator />
        </View>
      </View>
      <ToastContainer />
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <DashboardLayout />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  mainArea: {
    flex: 1,
    flexDirection: 'column',
    minHeight: '100%',
  },
  contentArea: {
    flex: 1,
    padding: 0,
    minHeight: '100%',
  },
}); 
