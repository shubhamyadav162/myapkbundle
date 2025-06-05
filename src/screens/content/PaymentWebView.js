import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  BackHandler, 
  Alert, 
  TouchableOpacity, 
  Text 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const PaymentWebView = () => {
  const [loading, setLoading] = useState(true);
  const [pollActive, setPollActive] = useState(false);
  const webViewRef = useRef(null);
  const pollTimerRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    paymentLink, 
    transactionId, 
    billId, 
    planId, 
    onPaymentComplete 
  } = route.params || {};

  useEffect(() => {
    // Handle back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    // Set up polling for payment status
    setPollActive(true);

    return () => {
      backHandler.remove();
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
      setPollActive(false);
    };
  }, []);

  useEffect(() => {
    if (pollActive) {
      pollPaymentStatus();
    }
  }, [pollActive]);

  const handleBackPress = () => {
    Alert.alert(
      'भुगतान रद्द करें?',
      'क्या आप वाकई भुगतान प्रक्रिया से बाहर निकलना चाहते हैं?',
      [
        { text: 'नहीं', style: 'cancel', onPress: () => {} },
        { text: 'हां', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
    return true;
  };

  const pollPaymentStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'check-payment-status',
        {
          body: { 
            transactionId,
          }
        }
      );
      
      if (error) {
        console.error('Error from payment status function:', error);
        // Fallback: check directly using Supabase
        const { data: txData, error: txError } = await supabase
          .from('payment_transactions')
          .select('status')
          .eq('id', transactionId)
          .single();
          
        if (!txError && txData) {
          if (txData.status === 'COMPLETED') {
            Alert.alert(
              'भुगतान सफल',
              'आपका भुगतान सफलतापूर्वक हो गया है। अब आप प्रीमियम कंटेंट का आनंद ले सकते हैं।',
              [{ text: 'ठीक है', onPress: handlePaymentSuccess }]
            );
            return;
          } else if (txData.status === 'FAILED') {
            Alert.alert(
              'भुगतान असफल',
              'भुगतान प्रक्रिया असफल रही। कृपया फिर से प्रयास करें।',
              [{ text: 'ठीक है', onPress: () => navigation.goBack() }]
            );
            return;
          }
        }
      } else {
        if (data.status === 'COMPLETED') {
          Alert.alert(
            'भुगतान सफल',
            'आपका भुगतान सफलतापूर्वक हो गया है। अब आप प्रीमियम कंटेंट का आनंद ले सकते हैं।',
            [{ text: 'ठीक है', onPress: handlePaymentSuccess }]
          );
          return;
        } else if (data.status === 'FAILED') {
          Alert.alert(
            'भुगतान असफल',
            'भुगतान प्रक्रिया असफल रही। कृपया फिर से प्रयास करें।',
            [{ text: 'ठीक है', onPress: () => navigation.goBack() }]
          );
          return;
        }
      }
      
      // Continue polling if payment is still in progress
      if (pollActive) {
        pollTimerRef.current = setTimeout(pollPaymentStatus, 3000);
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
      if (pollActive) {
        pollTimerRef.current = setTimeout(pollPaymentStatus, 5000);
      }
    }
  };

  const handlePaymentSuccess = () => {
    if (onPaymentComplete) {
      onPaymentComplete(planId);
    }
    navigation.goBack();
  };

  const handleNavigationStateChange = (navState) => {
    // You can handle specific URL changes here if needed
    setLoading(navState.loading);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>भुगतान</Text>
        <View style={styles.spacer} />
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F50057" />
          <Text style={styles.loadingText}>भुगतान पेज लोड हो रहा है...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: paymentLink }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => null}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#222',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  spacer: {
    width: 30,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FFF',
  },
});

export default PaymentWebView; 
