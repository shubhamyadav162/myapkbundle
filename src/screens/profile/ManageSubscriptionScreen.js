import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import theme from '../../theme';
import { useAuth } from '../../context/AuthProvider';
import { useSubscription } from '../../context/SubscriptionProvider';

const ManageSubscriptionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    isSubscribed, 
    subscriptionDetails, 
    formatExpirationDate, 
    handleCancelSubscription, 
    checkSubscriptionStatus 
  } = useSubscription();
  
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  // Load user's subscriptions
  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id, 
          status, 
          current_period_start, 
          current_period_end, 
          canceled_at,
          plans:plan_id (
            id, name, price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        Alert.alert('त्रुटि', 'सदस्यता विवरण लोड करने में विफल।');
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await checkSubscriptionStatus();
    await loadSubscriptions();
  };

  // Handle back button press
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle subscription cancellation
  const confirmCancelSubscription = (subscriptionId) => {
    Alert.alert(
      'सदस्यता रद्द करें?',
      'क्या आप वाकई अपनी सदस्यता रद्द करना चाहते हैं? आप अभी भी समाप्ति तिथि तक सामग्री का उपयोग कर सकेंगे।',
      [
        {
          text: 'नहीं',
          style: 'cancel'
        },
        {
          text: 'हां, रद्द करें',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const success = await handleCancelSubscription(subscriptionId);
            if (success) {
              await loadSubscriptions(); // Reload the list
            }
            setIsLoading(false);
          }
        }
      ]
    );
  };

  // Handle resubscription
  const handleResubscribe = () => {
    navigation.navigate('Subscription');
  };

  // Determine subscription status label and color
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return { label: 'सक्रिय', color: theme.colors.success };
      case 'canceled':
        return { label: 'रद्द', color: theme.colors.error };
      case 'past_due':
        return { label: 'भुगतान देय', color: theme.colors.warning };
      case 'trialing':
        return { label: 'परीक्षण', color: theme.colors.info };
      default:
        return { label: status, color: theme.colors.textSecondary };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>सदस्यता प्रबंधन</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>लोड हो रहा है...</Text>
          </View>
        ) : (
          <>
            {/* Subscription Status Summary */}
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>सदस्यता स्थिति</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: isSubscribed ? theme.colors.success : theme.colors.error }]}>
                  <Text style={styles.statusBadgeText}>{isSubscribed ? 'सक्रिय' : 'निष्क्रिय'}</Text>
                </View>
                {subscriptionDetails?.expiresAt && (
                  <Text style={styles.expiryText}>
                    {isSubscribed 
                      ? `${formatExpirationDate(subscriptionDetails.expiresAt)} तक वैध` 
                      : `${formatExpirationDate(subscriptionDetails.expiresAt)} को समाप्त हुआ`}
                  </Text>
                )}
              </View>
              {subscriptionDetails?.planName && (
                <Text style={styles.planText}>
                  वर्तमान योजना: {subscriptionDetails.planName}
                </Text>
              )}
            </View>

            {/* All Subscriptions */}
            <Text style={styles.sectionTitle}>सदस्यता इतिहास</Text>
            
            {subscriptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateText}>कोई सदस्यता इतिहास नहीं मिला</Text>
              </View>
            ) : (
              subscriptions.map((subscription) => {
                const status = getStatusLabel(subscription.status);
                const isActive = subscription.status === 'active';
                const hasExpired = isActive && new Date(subscription.current_period_end) < new Date();
                
                return (
                  <View key={subscription.id} style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                      <Text style={styles.planName}>{subscription.plans?.name || 'सदस्यता योजना'}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusBadgeText}>{status.label}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.subscriptionDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>शुरू हुआ:</Text>
                        <Text style={styles.detailValue}>
                          {formatExpirationDate(subscription.current_period_start)}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>समाप्ति:</Text>
                        <Text style={styles.detailValue}>
                          {formatExpirationDate(subscription.current_period_end)}
                        </Text>
                      </View>
                      
                      {subscription.canceled_at && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>रद्द किया गया:</Text>
                          <Text style={styles.detailValue}>
                            {formatExpirationDate(subscription.canceled_at)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.actionRow}>
                      {isActive && !hasExpired ? (
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={() => confirmCancelSubscription(subscription.id)}
                        >
                          <Text style={styles.cancelButtonText}>सदस्यता रद्द करें</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={styles.renewButton}
                          onPress={handleResubscribe}
                        >
                          <Text style={styles.renewButtonText}>फिर से सदस्यता लें</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
            
            {/* Subscription Actions */}
            <View style={styles.actionsContainer}>
              {!isSubscribed && (
                <TouchableOpacity 
                  style={styles.subscribeButton}
                  onPress={handleResubscribe}
                >
                  <Text style={styles.subscribeButtonText}>नई सदस्यता प्राप्त करें</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.supportButton}
                onPress={() => Alert.alert('समर्थन', 'सदस्यता से संबंधित किसी भी समस्या के लिए, कृपया support@onebigshow.com पर संपर्क करें।')}
              >
                <Text style={styles.supportButtonText}>सदस्यता सहायता</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
  contentContainer: {
    padding: theme.spacing.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: theme.spacing.small,
    color: theme.colors.textSecondary,
  },
  statusCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  statusTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
  },
  expiryText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
  },
  planText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    marginTop: theme.spacing.small,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
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
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  planName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
  },
  subscriptionDetails: {
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
  actionRow: {
    marginTop: theme.spacing.small,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.small,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  renewButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  renewButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  actionsContainer: {
    marginTop: theme.spacing.large,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  subscribeButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
  },
  supportButton: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  supportButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
  },
});

export default ManageSubscriptionScreen; 
