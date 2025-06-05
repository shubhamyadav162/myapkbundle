import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';

const SubscriptionModal = ({ visible, onClose, onSuccess, contentTitle }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (visible) {
      fetchSubscriptionPlans();
    }
  }, [visible]);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription plans');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (plan) => {
    try {
      setProcessingPayment(true);
      
      // Call our Edge Function to initiate payment
      const { data: apiData, error: apiError } = await supabase.functions.invoke(
        'initialize-payment',
        {
          body: {
            userId: user.id,
            planId: plan.id,
            callbackUrl: 'bigshow://payment-success'
          }
        }
      );

      if (apiError) throw apiError;
      
      if (!apiData.success) {
        throw new Error(apiData.error || 'Failed to initiate payment');
      }

      // Open payment link in WebView
      const { paymentLink, transactionId, billId } = apiData;
      
      // Navigate to payment WebView
      onClose();
      navigation.navigate('PaymentWebView', { 
        paymentLink,
        transactionId,
        billId,
        planId: plan.id,
        onPaymentComplete: onSuccess
      });
      
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Could not process payment');
      console.error('Payment initiation error:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.planCard}
      onPress={() => initiatePayment(item)}
      disabled={processingPayment}
    >
      <Text style={styles.planName}>{item.name}</Text>
      <Text style={styles.planPrice}>₹{item.price}</Text>
      <Text style={styles.planDuration}>{item.duration_days} दिन</Text>
      {item.features && (
        <View style={styles.featuresContainer}>
          {JSON.parse(item.features).map((feature, index) => (
            <Text key={index} style={styles.featureText}>• {feature}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>सब्सक्रिप्शन आवश्यक</Text>
          
          {contentTitle && (
            <Text style={styles.contentTitle}>
              "{contentTitle}" देखने के लिए सब्सक्राइब करें
            </Text>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#F50057" />
          ) : (
            <FlatList
              data={plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.plansList}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>बंद करें</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  plansList: {
    paddingVertical: 10,
  },
  planCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F50057',
    marginBottom: 5,
  },
  planDuration: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 10,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#444',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionModal; 
