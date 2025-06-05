import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import theme from '../../theme';
import { useAuth } from '../../context/AuthProvider';

const AdminSubscriptionsScreen = () => {
  const navigation = useNavigation();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cancelled: 0,
    expired: 0
  });

  // Load all subscriptions using the Edge Function
  useEffect(() => {
    if (session?.access_token) {
      loadSubscriptions();
    }
  }, [session]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-all-subscriptions', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        Alert.alert('Error', 'Failed to load subscription data');
      } else {
        setSubscriptions(data || []);
        
        // Calculate statistics
        const allSubs = data || [];
        const active = allSubs.filter(sub => sub.status === 'active').length;
        const cancelled = allSubs.filter(sub => sub.status === 'cancelled').length;
        const expired = allSubs.filter(sub => 
          sub.status === 'active' && new Date(sub.expires_at) < new Date()
        ).length;
        
        setStats({
          total: allSubs.length,
          active,
          cancelled,
          expired
        });
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
  };

  // Handle back button press
  const handleBack = () => {
    navigation.goBack();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine subscription status label and color
  const getStatusLabel = (subscription) => {
    if (subscription.status === 'cancelled') {
      return { label: 'रद्द', color: theme.colors.error };
    }
    
    if (subscription.status === 'active') {
      const expiryDate = new Date(subscription.expires_at);
      if (expiryDate < new Date()) {
        return { label: 'समाप्त', color: theme.colors.warning };
      }
      return { label: 'सक्रिय', color: theme.colors.success };
    }
    
    return { label: subscription.status, color: theme.colors.textSecondary };
  };

  // Filter subscriptions based on status
  const getFilteredSubscriptions = () => {
    if (filterStatus === 'all') {
      return subscriptions;
    }
    
    if (filterStatus === 'active') {
      return subscriptions.filter(sub => 
        sub.status === 'active' && new Date(sub.expires_at) >= new Date()
      );
    }
    
    if (filterStatus === 'expired') {
      return subscriptions.filter(sub => 
        sub.status === 'active' && new Date(sub.expires_at) < new Date()
      );
    }
    
    if (filterStatus === 'cancelled') {
      return subscriptions.filter(sub => sub.status === 'cancelled');
    }
    
    return subscriptions;
  };

  // Render subscription item
  const renderSubscriptionItem = ({ item }) => {
    const status = getStatusLabel(item);
    
    return (
      <View style={styles.subscriptionCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusBadgeText}>{status.label}</Text>
          </View>
          <Text style={styles.userIdText}>उपयोगकर्ता: {item.user_id.slice(0, 8)}...</Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>प्लान:</Text>
            <Text style={styles.detailValue}>{item.plan_id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>शुरू:</Text>
            <Text style={styles.detailValue}>{formatDate(item.starts_at)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>समाप्ति:</Text>
            <Text style={styles.detailValue}>{formatDate(item.expires_at)}</Text>
          </View>
          
          {item.status === 'cancelled' && item.cancelled_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>रद्द किया गया:</Text>
              <Text style={styles.detailValue}>{formatDate(item.cancelled_at)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.subscriptionIdText}>
            ID: {item.id}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>सभी सदस्यताएँ</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>कुल</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.success + '20' }]}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>सक्रिय</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text style={styles.statValue}>{stats.expired}</Text>
            <Text style={styles.statLabel}>समाप्त</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={styles.statValue}>{stats.cancelled}</Text>
            <Text style={styles.statLabel}>रद्द</Text>
          </View>
        </View>
        
        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterStatus === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'all' && styles.filterButtonTextActive
            ]}>सभी</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterStatus === 'active' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'active' && styles.filterButtonTextActive
            ]}>सक्रिय</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterStatus === 'expired' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('expired')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'expired' && styles.filterButtonTextActive
            ]}>समाप्त</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filterStatus === 'cancelled' && styles.filterButtonActive
            ]}
            onPress={() => setFilterStatus('cancelled')}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === 'cancelled' && styles.filterButtonTextActive
            ]}>रद्द</Text>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>सदस्यता डेटा लोड हो रहा है...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredSubscriptions()}
            renderItem={renderSubscriptionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateText}>कोई सदस्यता नहीं मिली</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.medium,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.small,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.medium,
    marginHorizontal: theme.spacing.tiny,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.backgroundLight,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
    backgroundColor: theme.colors.backgroundLight,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.small,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xlarge,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
    borderRadius: theme.borderRadius.small,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userIdText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  cardDetails: {
    marginVertical: theme.spacing.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.small,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
  },
  cardFooter: {
    marginTop: theme.spacing.small,
    paddingTop: theme.spacing.small,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subscriptionIdText: {
    fontSize: theme.typography.fontSize.xsmall,
    color: theme.colors.textSecondary,
  },
});

export default AdminSubscriptionsScreen; 
