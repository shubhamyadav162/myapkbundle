import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';
import { Linking } from 'react-native';

// Create the subscription context
const SubscriptionContext = createContext(null);

// Hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Environment check
const isProduction = process.env.NODE_ENV === 'production';

// Subscription Provider component
export const SubscriptionProvider = ({ children }) => {
  const { user, session } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [accessibleRoutes, setAccessibleRoutes] = useState(['HomeScreen', 'ProfileScreen', 'SubscriptionScreen']);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check subscription status on mount and when user changes
  useEffect(() => {
    if (session?.access_token) {
      checkSubscriptionStatus();
      fetchSubscriptionPlans();
    } else {
      setIsSubscribed(false);
      setSubscriptionDetails(null);
      setIsLoading(false);
    }
  }, [session]);

  // Fetch available subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price');
      
      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setAvailablePlans(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
      
      // Use default plans as fallback
      setAvailablePlans([
        { id: 'annual', name: 'Annual Plan', price: 1999, duration_days: 365 },
        { id: 'semi-annual', name: 'Semi-Annual Plan', price: 1199, duration_days: 180 },
        { id: 'quarterly', name: 'Quarterly Plan', price: 699, duration_days: 90 },
        { id: 'monthly', name: 'Monthly Plan', price: 299, duration_days: 30 },
        { id: 'trial', name: 'Trial Plan', price: 0, duration_days: 7 }
      ]);
    }
  };

  // Function to check subscription status with retry
  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      
      let response = null;
      let error = null;
      
      try {
        // Try to use the Edge Function
        response = await supabase.functions.invoke('get-user-subscription', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
      } catch (err) {
        console.error('Edge Function error:', err);
        error = err;
      }
      
      // If the Edge Function failed, try checking from the database directly
      if (error || !response || response.error) {
        console.log('Falling back to direct DB check...');
        
        try {
          // Check subscriptions table
          const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', user.id)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (!subError && subscriptions && subscriptions.length > 0) {
            const subscription = subscriptions[0];
            const now = new Date();
            const expiresAt = new Date(subscription.expires_at);
            
            if (expiresAt > now) {
              setIsSubscribed(true);
              setSubscriptionDetails({
                status: 'active',
                planId: subscription.subscription_plan_id,
                planName: subscription.subscription_plans?.name,
                expiresAt: subscription.expires_at,
                subscriptionId: subscription.id
              });
              
              setAccessibleRoutes([
                'HomeScreen', 
                'ProfileScreen', 
                'SubscriptionScreen', 
                'VideoScreen',
                'VideoPlayerScreen',
                'ContentDetailsScreen',
                'SearchScreen',
                'CategoryScreen'
              ]);
              
              setIsLoading(false);
              return;
            }
          }
          
          // Check profiles table as fallback
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_subscribed, subscription_end_date, current_plan_id')
            .eq('user_id', user.id)
            .single();
            
          if (!profileError && profile && profile.is_subscribed) {
            const now = new Date();
            const expiresAt = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
            
            if (expiresAt && expiresAt > now) {
              setIsSubscribed(true);
              setSubscriptionDetails({
                status: 'active',
                planId: profile.current_plan_id || 'unknown',
                planName: profile.current_plan_id || 'Subscription',
                expiresAt: profile.subscription_end_date
              });
              
              setAccessibleRoutes([
                'HomeScreen', 
                'ProfileScreen', 
                'SubscriptionScreen', 
                'VideoScreen',
                'VideoPlayerScreen',
                'ContentDetailsScreen',
                'SearchScreen',
                'CategoryScreen'
              ]);
              
              setIsLoading(false);
              return;
            }
          }
          
          // No subscription found
          setIsSubscribed(false);
          setSubscriptionDetails(null);
          setAccessibleRoutes(['HomeScreen', 'ProfileScreen', 'SubscriptionScreen']);
          setIsLoading(false);
          return;
        } catch (dbError) {
          console.error('Database check error:', dbError);
          // Continue with retry logic
        }
      }
      
      // Process Edge Function response
      if (response && !response.error) {
        console.log('Subscription status response:', response);
        setIsSubscribed(response.status === 'active');
        setSubscriptionDetails({
          status: response.status,
          planId: response.plan_id,
          planName: response.plan_name,
          expiresAt: response.expires_at,
          subscriptionId: response.subscription_id
        });
        
        // Update accessible routes based on subscription status
        if (response.status === 'active') {
          setAccessibleRoutes([
            'HomeScreen', 
            'ProfileScreen', 
            'SubscriptionScreen', 
            'VideoScreen',
            'VideoPlayerScreen',
            'ContentDetailsScreen',
            'SearchScreen',
            'CategoryScreen'
          ]);
        } else {
          setAccessibleRoutes(['HomeScreen', 'ProfileScreen', 'SubscriptionScreen']);
        }
      } else {
        console.error('Error checking subscription:', response?.error || error);
        
        // Retry logic for Edge Function errors
        if (retryCount < 3) {
          setRetryCount(retryCount + 1);
          setTimeout(() => {
            checkSubscriptionStatus();
          }, 2000); // Retry after 2 seconds
          return;
        }
        
        // After max retries, default to not subscribed
        setIsSubscribed(false);
        setSubscriptionDetails(null);
        setAccessibleRoutes(['HomeScreen', 'ProfileScreen', 'SubscriptionScreen']);
      }
    } catch (err) {
      console.error('Failed to check subscription status:', err);
      setIsSubscribed(false);
      setSubscriptionDetails(null);
      setAccessibleRoutes(['HomeScreen', 'ProfileScreen', 'SubscriptionScreen']);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to initialize payment
  const initializePayment = async (planId) => {
    try {
      if (!user || !session) {
        Alert.alert('Error', 'You must be logged in to subscribe');
        return null;
      }
      
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          user_id: user.id,
          plan_id: planId
        }
      });
      
      if (error) {
        console.error('Error initializing payment:', error);
        Alert.alert('Error', 'Failed to initialize payment process');
        return null;
      }
      
      if (!data.success) {
        console.error('Payment initialization failed:', data.error);
        Alert.alert('Error', data.error || 'Failed to initialize payment');
        return null;
      }
      
      setCurrentTransaction({
        id: data.transactionId,
        paymentLink: data.paymentLink
      });
      
      return data;
    } catch (err) {
      console.error('Failed to initialize payment:', err);
      Alert.alert('Error', 'An unexpected error occurred');
      return null;
    }
  };

  // Function to check payment status
  const checkPaymentStatus = async (transactionId) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: {
          transactionId
        }
      });
      
      if (error) {
        console.error('Error checking payment status:', error);
        return { success: false, error: error.message };
      }
      
      if (!data.success) {
        return { success: false, error: data.error || 'Unknown error' };
      }
      
      // If payment is completed, refresh subscription status
      if (data.status === 'COMPLETED') {
        await checkSubscriptionStatus();
      }
      
      return data;
    } catch (err) {
      console.error('Failed to check payment status:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to handle subscription purchase
  const handleSubscribe = async (planId) => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to subscribe');
        return false;
      }
      
      const paymentData = await initializePayment(planId);
      if (!paymentData) return false;
      
      // Open payment link in browser
      if (paymentData.paymentLink) {
        await Linking.openURL(paymentData.paymentLink);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      Alert.alert('Error', 'Failed to process subscription request');
      return false;
    }
  };

  // Function to handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      if (!user || !subscriptionDetails?.subscriptionId) {
        Alert.alert('Error', 'No active subscription found');
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          user_id: user.id,
          subscription_id: subscriptionDetails.subscriptionId
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (error) {
        console.error('Error cancelling subscription:', error);
        Alert.alert('Error', 'Failed to cancel subscription');
        return false;
      }
      
      // Refresh subscription status
      await checkSubscriptionStatus();
      
      Alert.alert('Success', 'Your subscription has been cancelled');
      return true;
    } catch (error) {
      console.error('Error in handleCancelSubscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription');
      return false;
    }
  };

  // Check if a route is accessible based on subscription
  const isRouteAccessible = (routeName) => {
    return accessibleRoutes.includes(routeName);
  };

  // Format expiration date
  const formatExpirationDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const contextValue = {
    isSubscribed,
    isLoading,
    subscriptionDetails,
    availablePlans,
    currentTransaction,
    checkSubscriptionStatus,
    initializePayment,
    checkPaymentStatus,
    handleSubscribe,
    handleCancelSubscription,
    isRouteAccessible,
    formatExpirationDate,
    isProduction
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 
