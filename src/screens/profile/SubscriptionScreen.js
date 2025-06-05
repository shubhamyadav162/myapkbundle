import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import theme from '../../theme';
import { useAuth } from '../../context/AuthProvider';
import { useSubscription } from '../../context/SubscriptionProvider';

// Import API services
import subscriptionApi from '../../api/subscriptionApi';

// Add default subscription plans fallback
const defaultPlans = [
  {
    id: 'annual',
    label: 'Annual (Best Value)',
    name: 'Annual (Best Value)',
    duration: '12 months',
    price: 699,
    pricePerDay: 1.9,
    savings: 71,
    isBestValue: true,
    description: '12 months subscription plan',
    duration_days: 360,
  },
  {
    id: 'semi-annual',
    label: 'Semi-Annual',
    name: 'Semi-Annual',
    duration: '6 months',
    price: 599,
    pricePerDay: 3.3,
    savings: 50,
    isBestValue: false,
    description: '6 months subscription plan',
    duration_days: 180,
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    name: 'Quarterly',
    duration: '3 months',
    price: 299,
    pricePerDay: 3.3,
    savings: 50,
    isBestValue: false,
    description: '3 months subscription plan',
    duration_days: 90,
  },
  {
    id: 'monthly',
    label: 'Monthly',
    name: 'Monthly',
    duration: '1 month',
    price: 199,
    pricePerDay: 6.6,
    savings: null,
    isBestValue: false,
    description: '1 month subscription plan',
    duration_days: 30,
  },
  {
    id: 'short-term-intro',
    label: 'Short-Term Intro',
    name: 'Short-Term Intro',
    duration: '15 days',
    price: 149,
    pricePerDay: 9.9,
    savings: 67,
    isBestValue: false,
    description: '15 days subscription plan',
    duration_days: 15,
  },
  {
    id: 'trial',
    label: 'Trial',
    name: 'Trial',
    duration: '3 days',
    price: 99,
    pricePerDay: 33,
    savings: null,
    isBestValue: false,
    description: '3 days subscription plan',
    duration_days: 3,
  },
];

// Helper to create enhanced default plans if needed (though now pre-enhanced)
const getEnhancedDefaultPlans = () => defaultPlans.map(plan => ({
  ...plan,
  label: plan.label || plan.name,
}));

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const { user, session } = useAuth();
  const { isSubscribed, subscriptionDetails, checkSubscriptionStatus } = useSubscription();
  console.log('Current user in SubscriptionScreen:', user);
  
  // State
  const [plans, setPlans] = useState(getEnhancedDefaultPlans());
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Load plans and current subscription from backend
  useEffect(() => {
    const loadSubscriptionData = async () => {
      setError(null);
      let finalPlansToSet = [];

      try {
        // Fetch available plans
        const plansRes = await subscriptionApi.getSubscriptionPlans();
        if (plansRes && plansRes.data && plansRes.success && Array.isArray(plansRes.data.plans) && plansRes.data.plans.length > 0) {
          console.log('Loaded plans from API:', plansRes.data.plans.length);
          finalPlansToSet = plansRes.data.plans.map(p => ({
            ...p,
            name: p.name || p.label || 'Subscription Plan',
            description: p.description || `${p.duration || 'Standard'} plan`,
            duration_days: p.duration_days || (p.duration ? (p.duration.includes('month') ? parseInt(p.duration) * 30 : (p.duration.includes('day') ? parseInt(p.duration) : (p.duration.includes('year') ? 365 : 30) )) : 30),
          }));
          setPlans(finalPlansToSet);
        } else {
          console.log('API plans not available or empty, using default plans.');
        }
      } catch (apiPlanError) {
        console.error('Error fetching subscription plans from API:', apiPlanError);
        setError('Unable to load subscription plans. Using default plans.');
      }
      
      // Fetch current subscription status
      try {
        if (user && user.id) {
          const currentRes = await subscriptionApi.getCurrentSubscription();
          if (currentRes && currentRes.data && currentRes.success) {
            const { planId, subscriptionEnd, isSubscribed } = currentRes.data;
            const planObj = finalPlansToSet.length > 0 ? 
              finalPlansToSet.find(p => p.id === planId) : 
              plans.find(p => p.id === planId) || null;
            setCurrentPlan({
              planId,
              name: planObj?.name || planObj?.label || planId,
              expiresAt: subscriptionEnd,
              status: isSubscribed ? 'active' : 'inactive'
            });
          } else {
            console.log('Could not fetch current subscription or no active subscription.');
            setCurrentPlan(null);
          }
        } else {
          console.log('User not available, skipping fetching current subscription.');
          setCurrentPlan(null);
        }
      } catch (currentSubError) {
        console.error('Error fetching current subscription:', currentSubError);
        setError(prevError => prevError ? prevError + '; Unable to load current subscription' : 'Unable to load current subscription');
        setCurrentPlan(null);
      }
    };
    loadSubscriptionData();
  }, [user]);
  
  useEffect(() => {
    if (user && user.id) {
      fetchSubscriptionStatus();
    }
    
    // Listen for deep link navigations from payment gateway
    const handleDeepLink = async (url) => {
      if (!url) return;
      try {
        console.log('Deep link received:', url);
        
        // 修正: 手动解析 URL 代替使用 Linking.parse
        const urlObj = new URL(url);
        const path = urlObj.pathname || '';
        const searchParams = new URLSearchParams(urlObj.search);
        const transaction_id = searchParams.get('transaction_id');
        
        console.log('Parsed deep link:', {
          path: path.replace(/^\/+/, ''), // 删除开头的斜杠
          transaction_id
        });
        
        if ((path.includes('payment-callback') || path.includes('payment-status')) && transaction_id) {
          console.log('Navigating to PaymentStatus with transaction_id:', transaction_id);
          navigation.navigate('PaymentStatus', { 
            transactionId: transaction_id
          });
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };
    
    // Add deep link listener
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check initial URL
    Linking.getInitialURL().then(url => {
        if (url) {
            handleDeepLink(url);
        }
    }).catch(err => console.warn('An error occurred while getting initial URL', err));
    
    return () => {
      linkingSubscription.remove();
    };
  }, [navigation, user]);

  const fetchSubscriptionStatus = async () => {
    try {
      if (!user || !user.id) {
          console.log('User or user.id not available for fetching subscription status.');
          setSubscription(null);
          return;
      }
      
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('is_subscribed, subscription_end_date, current_plan_id')
        .eq('user_id', user.id)
        .single();

      if (supabaseError) {
        console.error('Error fetching subscription from profiles:', supabaseError.message);
        
        // Try alternate approach with subscription table
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subError) {
          console.error('Error fetching from user_subscriptions:', subError.message);
          setSubscription(null);
          return;
        }
        
        if (subData) {
          const isActive = subData.is_active && new Date(subData.end_date) > new Date();
          setSubscription({
            is_subscribed: isActive,
            subscription_end_date: subData.end_date,
            current_plan_id: subData.plan_id
          });
          return;
        }
        
        // If no subscription found in either table
        setSubscription(null);
        return;
      }
      
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription status from Supabase:', error.message);
      setSubscription(null);
    }
  };

  // Handle plan selection
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };
  
  // Handle continue to payment
  const handleSubscribe = async (plan) => {
    if (!user || !user.id) {
      console.log('User missing in handleSubscribe:', user);
      Alert.alert('Error', 'User session not found. Please log in again and try again.');
      return;
    }

    if (!plan || !plan.id) {
      console.error('Invalid plan data on subscribe:', plan);
      Alert.alert('Error', 'Invalid plan data. Please try again later.');
      return;
    }
      
    setIsProcessing(true);
    try {
      // Use initialize-payment edge function with appropriate callback URL
      const callbackUrl = 'com.bigshow.app://payment-callback';
      
      console.log('Initiating payment for plan:', plan.id, 'for user:', user.id);
      const { data, error: functionError } = await supabase.functions.invoke('initialize-payment', {
        body: {
          user_id: user.id,
          plan_id: plan.id,
          callbackUrl
        }
      });
      
      if (functionError) {
        console.error('Payment function error:', functionError);
        throw new Error(functionError.message || 'Payment initiation failed. Please try again later.');
      }
      
      if (!data) {
        throw new Error('No payment data returned');
      }
      
      console.log('Payment API response:', data);
      
      if (data.success && data.paymentLink) {
        console.log('Payment initialized successfully, payment URL:', data.paymentLink, 'Transaction ID:', data.transactionId);
        
        // Open the payment link in the default browser
        await Linking.openURL(data.paymentLink);
        
        // Navigate to payment status screen to check status
        navigation.navigate('PaymentStatus', { 
          transactionId: data.transactionId,
          planName: plan.name || 'Selected Plan'
        });
      } else {
        console.error('Payment initialization failed:', data?.error || 'No payment URL returned');
        throw new Error(data?.error || 'Payment initiation failed. No payment URL returned from server.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error.message, error.details || error);
      let displayErrorMessage = 'Payment initiation failed. Please try again later.';
      if (error.message && error.message.toLowerCase().includes('network request failed')) {
        displayErrorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('user')) {
        displayErrorMessage = 'User session issue. Please log in again and try again.';
      }
      Alert.alert('Error', displayErrorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle back button press
  const handleBack = () => {
    navigation.goBack();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderPlanItem = ({ item }) => (
    item ? (
      <View style={[
        styles.planCard,
        selectedPlan === item.id && styles.selectedPlanCard,
        currentPlan?.planId === item.id && currentPlan?.status === 'active' && styles.currentPlanCard
      ]}>
        {item.isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>Best Value</Text>
          </View>
        )}
        {currentPlan?.planId === item.id && currentPlan?.status === 'active' && (
           <View style={styles.currentPlanBadge}>
             <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
           </View>
        )}
        <Text style={styles.planName}>{item.name || item.label || 'Subscription Plan'}</Text>
        <Text style={styles.planPrice}>₹{item.price}</Text>
        <Text style={styles.planDuration}>{item.duration_days || item.duration || '30'} days</Text>
        <Text style={styles.planDescription}>{item.description || `${item.duration_days || 'Standard'} day plan`}</Text>
        
        {item.features && Array.isArray(item.features) && item.features.length > 0 ? (
          <View style={styles.featuresContainer}>
            {item.features.map((feature, index) => (
              <View key={typeof feature === 'string' ? feature : feature.id || index} style={styles.featureItem}>
                <Ionicons 
                  name={"checkmark-circle"} 
                  size={18} 
                  color={theme.colors.success} 
                />
                <Text style={styles.featureText}>
                  {typeof feature === 'string' ? feature : feature.name}
                </Text>
              </View>
            ))}
          </View>
        ) : (item.features && typeof item.features === 'object' && Object.keys(item.features).length > 0) ? (
          <View style={styles.featuresContainer}>
            {Object.entries(item.features).map(([key, value]) => (
              <View key={key} style={styles.featureItem}>
                <Ionicons 
                  name={value ? "checkmark-circle" : "close-circle"} 
                  size={18} 
                  color={value ? theme.colors.success : theme.colors.error} 
                />
                <Text style={styles.featureText}>
                  {key.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            (isProcessing && selectedPlan === item.id) && styles.disabledButton,
            (currentPlan?.planId === item.id && currentPlan?.status === 'active') && styles.disabledButton,
            Platform.OS === 'web' && { cursor: 'pointer' }
          ]}
          onPress={() => {
            setSelectedPlan(item.id);
            handleSubscribe(item);
          }}
          disabled={isProcessing || (currentPlan?.planId === item.id && currentPlan?.status === 'active')}
        >
          <Text style={styles.continueButtonText}>
            {(isProcessing && selectedPlan === item.id) ? 'Processing...' : (currentPlan?.planId === item.id && currentPlan?.status === 'active' ? 'Current Plan' : 'Subscribe')}
          </Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        {/* Show current subscription status immediately */}
        {currentPlan || isSubscribed ? (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanTitle}>Current Subscription</Text>
            <View style={styles.currentPlanContent}>
              <View style={styles.currentPlanRow}>
                <Text style={styles.currentPlanLabel}>Plan:</Text>
                <Text style={styles.currentPlanValue}>
                  {subscriptionDetails?.planName || currentPlan?.name || 'Unknown Plan'}
                </Text>
              </View>
              <View style={styles.currentPlanRow}>
                <Text style={styles.currentPlanLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: isSubscribed ? theme.colors.success : theme.colors.error }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {isSubscribed ? 'Active' : 'Expired'}
                  </Text>
                </View>
              </View>
              <View style={styles.currentPlanRow}>
                <Text style={styles.currentPlanLabel}>Expires:</Text>
                <Text style={styles.currentPlanValue}>
                  {formatDate(subscriptionDetails?.expiresAt || currentPlan?.expiresAt)}
                </Text>
              </View>
            </View>

            {/* Manage Subscription Button */}
            <TouchableOpacity
              style={styles.manageSubscriptionButton}
              onPress={() => navigation.navigate('ManageSubscription')}
            >
              <Text style={styles.manageSubscriptionText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Plans Section (loading vs list) */}
        <>
          {/* Plans Section Title */}
          <Text style={styles.sectionTitle}>
            {currentPlan || isSubscribed ? 'New Subscription Plans' : 'Available Subscription Plans'}
          </Text>

          {/* Plans List */}
          {plans.length > 0 ? (
            <FlatList
              data={plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.plansList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No subscription plans available</Text>
            </View>
          )}

          {/* Additional Information */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Subscribe to enjoy all of our premium content.
            </Text>
            <Text style={styles.infoText}>
              • Subscription fees are non-refundable.
            </Text>
            <Text style={styles.infoText}>
              • Different plans offer different pricing and durations.
            </Text>
            <Text style={styles.infoText}>
              • Please contact our customer service for any issues.
            </Text>
          </View>
        </>
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
  currentPlanContainer: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  currentPlanTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  currentPlanName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.tiny,
  },
  currentPlanValidity: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  plansList: {
    padding: theme.spacing.medium,
  },
  planCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.backgroundHighlight,
  },
  currentPlanCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  currentPlanTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  currentPlanContent: {
    marginBottom: theme.spacing.medium,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  currentPlanLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginRight: theme.spacing.small,
  },
  currentPlanValue: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
  },
  statusBadge: {
    paddingVertical: theme.spacing.tiny,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
    borderBottomLeftRadius: theme.borderRadius.small,
  },
  bestValueText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
    borderBottomLeftRadius: theme.borderRadius.small,
  },
  currentPlanBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
  },
  planName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.medium,
  },
  planPrice: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.tiny,
  },
  planDuration: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  planDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginBottom: theme.spacing.medium,
  },
  featuresContainer: {
    marginBottom: theme.spacing.medium,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  featureText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.medium,
    alignItems: 'center',
    marginTop: theme.spacing.small,
  },
  disabledButton: {
    backgroundColor: theme.colors.inactive,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
  },
  promoText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    lineHeight: 24,
    marginBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.medium,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginTop: theme.spacing.small,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginTop: theme.spacing.small,
  },
  infoContainer: {
    padding: theme.spacing.medium,
  },
  infoTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.small,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  manageSubscriptionButton: {
    backgroundColor: theme.colors.backgroundLight,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  manageSubscriptionText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default SubscriptionScreen; 
