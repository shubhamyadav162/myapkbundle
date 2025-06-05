import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, Card, Button, Icon, ListItem } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';
import { ToastContainer } from '../../components/common/Toast';
import themeBase from '../../theme';
import { db } from '../../utils/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

const DashboardContent = ({ stats, navigation, seriesList }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const toggleSection = section => setExpandedSection(prev => (prev === section ? null : section));
  const actionColor = themeBase.colors.accent;

  return (
    <View style={styles.contentArea}>
      {/* Recent series thumbnails */}
      {seriesList && seriesList.length > 0 && (
        <>
          <Text style={[styles.subHeader, { color: actionColor }]}>Recent Series</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {seriesList.map(series => series.thumbnailUrl && (
              <Image key={series.id} source={{ uri: series.thumbnailUrl }} style={styles.thumbnailImage} />
            ))}
          </ScrollView>
        </>
      )}
      <Text style={[styles.header, { color: actionColor }]}>Admin Dashboard</Text>

      <ListItem.Accordion
        content={
          <>
            <Icon name="tv" type="font-awesome" color={actionColor} size={24} />
            <ListItem.Content>
              <ListItem.Title style={{ color: actionColor }}>Series ({stats.series})</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expandedSection === 'Series'}
        onPress={() => toggleSection('Series')}
        containerStyle={styles.accordionContainer}
      >
        <Button title="Manage Series" onPress={() => navigation.navigate('Series')} buttonStyle={[styles.cardButton, { backgroundColor: actionColor }]} containerStyle={styles.buttonContainer} />
        <Button title="Add Series" type="outline" onPress={() => navigation.navigate('SeriesAdd')} buttonStyle={[styles.cardButton, { borderColor: actionColor }]} titleStyle={{ color: actionColor }} containerStyle={styles.buttonContainer} />
      </ListItem.Accordion>

      <ListItem containerStyle={styles.accordionContainer} onPress={() => navigation.navigate('Episodes')}>  
        <Icon name="video-camera" type="font-awesome" color={actionColor} size={24} />  
        <ListItem.Content>  
          <ListItem.Title style={{ color: actionColor }}>Episodes ({stats.episodes})</ListItem.Title>  
        </ListItem.Content>  
        <ListItem.Chevron color={actionColor} />
      </ListItem>

      <ListItem.Accordion
        content={
          <>
            <Icon name="film" type="font-awesome" color={actionColor} size={24} />
            <ListItem.Content>
              <ListItem.Title style={{ color: actionColor }}>Content Management</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expandedSection === 'ContentManagement'}
        onPress={() => toggleSection('ContentManagement')}
        containerStyle={styles.accordionContainer}
      >
        <Button title="Manage Content" onPress={() => navigation.navigate('ContentManagement')} buttonStyle={[styles.cardButton, { backgroundColor: actionColor }]} containerStyle={styles.buttonContainer} />
      </ListItem.Accordion>

      <ListItem.Accordion
        content={
          <>
            <Icon name="users" type="font-awesome" color={actionColor} size={24} />
            <ListItem.Content>
              <ListItem.Title style={{ color: actionColor }}>Users ({stats.users})</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expandedSection === 'Users'}
        onPress={() => toggleSection('Users')}
        containerStyle={styles.accordionContainer}
      >
        <Button title="Manage Users" onPress={() => navigation.navigate('Users')} buttonStyle={[styles.cardButton, { backgroundColor: actionColor }]} containerStyle={styles.buttonContainer} />
      </ListItem.Accordion>

      <ListItem.Accordion
        content={
          <>
            <Icon name="bar-chart" type="font-awesome" color={actionColor} size={24} />
            <ListItem.Content>
              <ListItem.Title style={{ color: actionColor }}>Analytics</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expandedSection === 'Analytics'}
        onPress={() => toggleSection('Analytics')}
        containerStyle={styles.accordionContainer}
      >
        <Button title="View Analytics" onPress={() => navigation.navigate('Analytics')} buttonStyle={[styles.cardButton, { backgroundColor: actionColor }]} containerStyle={styles.buttonContainer} />
      </ListItem.Accordion>

      <ListItem.Accordion
        content={
          <>
            <Icon name="cog" type="font-awesome" color={actionColor} size={24} />
            <ListItem.Content>
              <ListItem.Title style={{ color: actionColor }}>Settings</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expandedSection === 'Settings'}
        onPress={() => toggleSection('Settings')}
        containerStyle={styles.accordionContainer}
      >
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} buttonStyle={[styles.cardButton, { backgroundColor: actionColor }]} containerStyle={styles.buttonContainer} />
      </ListItem.Accordion>

    </View>
  );
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({ series: 0, episodes: 0, users: 0 });
  const [seriesList, setSeriesList] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState(null);
  const { isDarkMode, toggleTheme, theme } = useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: themeBase };

  // Remove the direct navigation function
  const navigateToUsers = () => {
    console.log('Direct navigation to Users from DashboardScreen');
    try {
      navigation.navigate('Users');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    // Real-time stats for series, episodes, and users
    const seriesUnsub = onSnapshot(collection(db, 'series'), snap => {
      setStats(prev => ({ ...prev, series: snap.size }));
    }, err => {
      console.error('Error fetching series count:', err);
      setError(prev => prev || err.message);
    });

    const episodesUnsub = onSnapshot(collection(db, 'episodes'), snap => {
      setStats(prev => ({ ...prev, episodes: snap.size }));
    }, err => {
      console.error('Error fetching episodes count:', err);
      setError(prev => prev || err.message);
    });

    const usersUnsub = onSnapshot(collection(db, 'users'), snap => {
      setStats(prev => ({ ...prev, users: snap.size }));
    }, err => {
      console.error('Error fetching users count:', err);
      setError(prev => prev || err.message);
    });

    return () => {
      seriesUnsub();
      episodesUnsub();
      usersUnsub();
    };
  }, []);

  // fetch all series for thumbnails
  useEffect(() => {
    // Real-time series list for dashboard thumbnails
    const unsub = onSnapshot(collection(db, 'series'), snap => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeriesList(data);
    }, err => {
      console.error('Error fetching series list:', err);
    });

    return () => unsub();
  }, []);

  // Responsive layout
  const isMobile = Dimensions.get('window').width < 768;

  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.background }]}> 
      <HeaderBar
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationCount={0}
        onLogout={() => {}}
        onSettings={() => {}}
      />
      
      {/* Remove emergency nav bar */}
      
      <View style={styles.body}>
        {!isMobile && (
          <Sidebar
            navigation={navigation}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        )}
        <View style={styles.mainContent}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error connecting to database: {error}</Text>
              <Text style={styles.errorSubText}>Using offline dashboard view</Text>
            </View>
          )}
          {/* Main dashboard content area */}
          <DashboardContent stats={stats} navigation={navigation} seriesList={seriesList} />
        </View>
      </View>
      <ToastContainer />
    </View>
  );
};

// Wrap with ThemeProvider for dark/light mode support
const DashboardScreenWithTheme = (props) => (
  <ThemeProvider>
    <DashboardScreen {...props} />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: '100vh',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 'calc(100vh - 64px)',
  },
  mainContent: {
    flex: 1,
    padding: themeBase.spacing.large,
    backgroundColor: 'transparent',
  },
  contentArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    color: themeBase.colors.text,
    marginBottom: themeBase.spacing.large,
    alignSelf: 'center',
    fontSize: themeBase.typography.fontSize.header,
    fontWeight: themeBase.typography.fontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: themeBase.spacing.large,
  },
  card: {
    flex: 1,
    borderRadius: themeBase.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: themeBase.spacing.medium,
    marginHorizontal: themeBase.spacing.small,
  },
  lightCard: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    ...themeBase.shadows.small,
  },
  cardTitle: {
    fontSize: themeBase.typography.fontSize.medium,
    fontWeight: themeBase.typography.fontWeight.bold,
    marginTop: themeBase.spacing.small,
  },
  cardValue: {
    fontSize: themeBase.typography.fontSize.xxlarge,
    fontWeight: themeBase.typography.fontWeight.black,
    marginVertical: themeBase.spacing.small,
  },
  cardButton: {
    borderRadius: themeBase.borderRadius.small,
    paddingHorizontal: themeBase.spacing.large,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorSubText: {
    color: '#555',
    fontSize: 12,
    marginTop: 5,
  },
  accordionContainer: {
    backgroundColor: themeBase.colors.backgroundLight,
    borderRadius: themeBase.borderRadius.medium,
    marginBottom: themeBase.spacing.small,
  },
  buttonContainer: {
    marginVertical: themeBase.spacing.tiny,
  },
  // series thumbnails styles
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  thumbnailContainer: {
    marginBottom: 20,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default DashboardScreenWithTheme; 
