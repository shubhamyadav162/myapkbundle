import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  BackHandler,
  Linking
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import theme from '../../theme';
import LottieView from 'lottie-react-native';
import { useAuth } from '../../context/AuthProvider';

const PaymentStatusScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { transactionId, planName, status: initialStatus } = route.params || {};
  const { user } = useAuth();
  
  const [status, setStatus] = useState(initialStatus || 'checking');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkCount, setCheckCount] = useState(0);

  // Check payment status on mount and set up interval
  useEffect(() => {
    if (transactionId) {
      checkPaymentStatus();
      
      // If we already have a status from deep linking, update accordingly
      if (initialStatus === 'SUCCESS') {
        setStatus('completed');
      } else if (initialStatus === 'FAILED') {
        setStatus('failed');
      }
      
      // Set up interval to check status every 5 seconds if still checking
      const interval = setInterval(() => {
        if (checkCount < 6 && status === 'checking') {
          checkPaymentStatus();
          setCheckCount(prev => prev + 1);
        } else if (checkCount >= 6 && status === 'checking') {
          // Stop checking after 30 seconds
          clearInterval(interval);
          setStatus('timeout');
        }
      }, 5000);
  
      // Clean up
      return () => clearInterval(interval);
    }
  }, [transactionId, checkCount, status, initialStatus]);

  // Handle deep links when screen is in focus
  useFocusEffect(
    React.useCallback(() => {
      const handleDeepLink = (url) => {
        if (!url) return;
        
        try {
          // Manual URL parsing instead of Linking.parse
          const urlObj = new URL(url);
          const path = urlObj.pathname || '';
          const searchParams = new URLSearchParams(urlObj.search);
          const linkTransactionId = searchParams.get('transaction_id');
          const linkStatus = searchParams.get('status');
          
          console.log('Payment callback parsed:', { path, linkTransactionId, linkStatus });
          
          if (path.includes('payment-callback')) {
            if (linkTransactionId && linkTransactionId !== transactionId) {
              // If this is a different transaction, navigate to a new instance
              navigation.navigate('PaymentStatus', {
                transactionId: linkTransactionId,
                status: linkStatus
              });
            } else if (linkStatus) {
              // Update current screen status
              if (linkStatus === 'SUCCESS') {
                setStatus('completed');
              } else if (linkStatus === 'FAILED') {
                setStatus('failed');
              }
            }
          }
        } catch (error) {
          console.error('Error parsing deep link:', error);
        }
      };
      
      // Check for any pending deep links
      Linking.getInitialURL().then(url => {
        if (url) handleDeepLink(url);
      });
      
      // Listen for deep links while screen is focused
      const subscription = Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url);
      });
      
      return () => {
        subscription.remove();
      };
    }, [navigation, transactionId])
  );

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (status === 'completed') {
          navigation.navigate('HomeTab');
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [status, navigation])
  );

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      
      if (!transactionId) {
        setError('Transaction ID is missing');
        setStatus('failed');
        return;
      }
      
      console.log('Checking payment status for transaction:', transactionId);
      
      // Call the check-payment-status edge function
      const { data, error: functionError } = await supabase.functions.invoke('check-payment-status', {
        body: { transactionId }
      });
      
      console.log('Payment status response:', data, functionError);
      
      if (functionError) throw functionError;
      
      if (!data) {
        throw new Error('No data returned from payment status check');
      }
      
      setTransaction(data.transaction);
      
      if (data.transaction?.status === 'COMPLETED') {
        setStatus('completed');
      } else if (data.transaction?.status === 'FAILED') {
        setStatus('failed');
      } else if (data.transaction?.status === 'PENDING' || data.transaction?.status === 'INITIATE') {
        setStatus('checking');
      } else {
        setStatus('unknown');
      }
      
      // Update user subscription if completed and we have user data
      if (data.subscription && user && data.transaction?.status === 'COMPLETED') {
        console.log('User subscription updated:', data.subscription);
      }
    } catch (error) {
      console.error('Error checking payment status:', error.message);
      setError('भुगतान की स्थिति की जांच करने में समस्या हुई है।');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigation.navigate('HomeTab');
  };

  const tryAgain = () => {
    navigation.navigate('SubscriptionScreen');
  };

  const getStatusMessage = () => {
    switch(status) {
      case 'completed':
        return 'आपका भुगतान सफल रहा है!';
      case 'failed':
        return 'भुगतान असफल रहा।';
      case 'checking':
        return 'भुगतान की स्थिति की जांच की जा रही है...';
      case 'timeout':
        return 'भुगतान की स्थिति की जांच करने में समय सीमा समाप्त हो गई है।';
      case 'error':
        return error || 'कुछ गलत हो गया है।';
      default:
        return 'अज्ञात भुगतान स्थिति।';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'completed':
        return (
          <LottieView
            source={require('../../../assets/animations/person.json')}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        );
      case 'failed':
      case 'error':
        return (
          <View style={[styles.statusIcon, styles.failedIcon]}>
            <Ionicons name="close" size={48} color="#fff" />
          </View>
        );
      case 'checking':
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
      case 'timeout':
        return (
          <View style={[styles.statusIcon, styles.timeoutIcon]}>
            <Ionicons name="time" size={48} color="#fff" />
          </View>
        );
      default:
        return (
          <View style={[styles.statusIcon, styles.unknownIcon]}>
            <Ionicons name="help" size={48} color="#fff" />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={status === 'completed' ? goHome : navigation.goBack}
        >
          <Ionicons 
            name={status === 'completed' ? "home" : "arrow-back"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>भुगतान स्थिति</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          
          {planName && (
            <Text style={styles.planName}>
              {status === 'completed' ? 'सक्रिय प्लान: ' : 'चयनित प्लान: '} 
              {planName}
            </Text>
          )}
          
          {status === 'completed' && (
            <Text style={styles.instructions}>
              अब आप प्रीमियम सामग्री का आनंद ले सकते हैं। अपने वीडियो देखना शुरू करने के लिए होम पेज पर जाएं।
            </Text>
          )}
          
          {(status === 'failed' || status === 'error') && (
            <Text style={styles.instructions}>
              भुगतान प्रक्रिया के दौरान एक समस्या हुई थी। कृपया पुनः प्रयास करें या बाद में प्रयास करें।
            </Text>
          )}
          
          {status === 'timeout' && (
            <Text style={styles.instructions}>
              भुगतान की स्थिति की पुष्टि करने में समय लग रहा है। कृपया अपनी ईमेल या बैंक एप में जांचें कि क्या भुगतान पूरा हुआ है।
            </Text>
          )}
          
          {status === 'checking' && (
            <Text style={styles.instructions}>
              कृपया प्रतीक्षा करें जबकि हम आपके भुगतान की स्थिति की जांच कर रहे हैं। यह कुछ क्षण लग सकता है।
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {status === 'completed' ? (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={goHome}
            >
              <Text style={styles.buttonText}>होम पेज पर जाएं</Text>
            </TouchableOpacity>
          ) : (status === 'failed' || status === 'error' || status === 'timeout') ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={tryAgain}
              >
                <Text style={styles.buttonText}>पुनः प्रयास करें</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={goHome}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>होम पेज पर जाएं</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={navigation.goBack}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>वापस जाएं</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    backgroundColor: '#4CAF50',
  },
  failedIcon: {
    backgroundColor: theme.colors.error,
  },
  timeoutIcon: {
    backgroundColor: theme.colors.warning,
  },
  unknownIcon: {
    backgroundColor: theme.colors.secondary,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  statusMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  transactionDetails: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
  },
  detailValue: {
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default PaymentStatusScreen; 
