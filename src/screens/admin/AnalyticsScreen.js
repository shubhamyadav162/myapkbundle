import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import HeaderBar from '../../components/common/HeaderBar';
import analyticsApi from '../../api/analyticsApi';

const AnalyticsCard = ({ title, value, icon, unit, color }) => (
  <Card containerStyle={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={24} color={color || theme.colors.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>
      <Text style={[styles.cardValue, color && { color }]}>{value}</Text>
      {unit && <Text style={styles.cardUnit}>{unit}</Text>}
    </View>
  </Card>
);

const AnalyticsContent = () => {
  const [data, setData] = useState({
    totalViews: '0',
    activeUsers: '0',
    avgWatchTime: '0',
    completionRate: '0',
    topContent: '',
    newSubscribers: '0',
  });

  useEffect(() => {
    const fetchOverview = async () => {
      const overview = await analyticsApi.getOverview();
      setData({
        totalViews: overview.totalViews.toLocaleString(),
        activeUsers: overview.activeUsers.toLocaleString(),
        avgWatchTime: overview.avgWatchTime.toString(),
        completionRate: overview.completionRate.toString(),
        topContent: overview.topContent,
        newSubscribers: overview.newSubscribers.toLocaleString(),
      });
    };
    fetchOverview();
  }, []);

  return (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.title}>Analytics Dashboard</Text>
      <Text style={styles.subtitle}>Platform performance metrics</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsRow}>
          <AnalyticsCard 
            title="Total Views" 
            value={data.totalViews} 
            icon="eye-outline" 
          />
          <AnalyticsCard 
            title="Active Users" 
            value={data.activeUsers} 
            icon="people-outline" 
          />
          <AnalyticsCard 
            title="Avg. Watch Time" 
            value={data.avgWatchTime} 
            unit="min" 
            icon="time-outline" 
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Performance</Text>
        <View style={styles.cardsRow}>
          <AnalyticsCard 
            title="Completion Rate" 
            value={data.completionRate} 
            unit="%" 
            icon="checkmark-circle-outline" 
            color="#4CAF50"
          />
          <AnalyticsCard 
            title="Top Content" 
            value={data.topContent} 
            icon="star-outline" 
            color="#FFC107"
          />
          <AnalyticsCard 
            title="New Subscribers" 
            value={data.newSubscribers} 
            icon="person-add-outline" 
            color="#2196F3"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports</Text>
        <View style={styles.reportsList}>
          {['Weekly Summary', 'Monthly Performance', 'Content Analytics', 'User Engagement'].map((report, index) => (
            <TouchableOpacity key={index} style={styles.reportItem}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.reportText}>{report}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const AnalyticsScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('analytics');
  const { isDarkMode, toggleTheme, theme: currentTheme } = useTheme ? useTheme() : { isDarkMode: false, toggleTheme: () => {}, theme: theme };
  
  useEffect(() => {
    console.log('AnalyticsScreen mounted');
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
        <AnalyticsContent />
      </View>
    </View>
  );
};

// Wrap with ThemeProvider to ensure theme context is available
const AnalyticsScreenWithTheme = (props) => (
  <ThemeProvider>
    <AnalyticsScreen {...props} />
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
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    minWidth: 250,
    margin: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.backgroundElevated,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  cardUnit: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
  },
  reportsList: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reportText: {
    flex: 1,
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
  },
});

export default AnalyticsScreenWithTheme; 
