import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../../theme';
import lightSpeedApi from '../../api/lightSpeedApi';

const paymentMethods = [
  { id: 'card', name: 'Credit / Debit Card', icon: 'credit-card', color: '#FF8A65' },
  { id: 'upi', name: 'UPI', icon: 'account-balance-wallet', color: '#4DB6AC' },
  { id: 'netbanking', name: 'Net Banking', icon: 'public', color: '#7986CB' },
  { id: 'wallet', name: 'Wallet', icon: 'account-balance-wallet', color: '#FFD54F' },
];

const { width } = Dimensions.get('window');
const cardWidth = (width - theme.spacing.medium * 3) / 2;

const PaymentMethodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const plan = route.params?.plan;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const SUCCESS_URL = 'bigshow://payment-success';
  const FAIL_URL = 'bigshow://payment-failure';

  useEffect(() => {
    if (!plan) {
      Alert.alert('Error', 'No plan selected / योजना निर्धारित नहीं हुई।');
      navigation.goBack();
    }
  }, [plan]);

  if (paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          originWhitelist={[ 'http://*', 'https://*', 'bigshow://*' ]}
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onShouldStartLoadWithRequest={request => {
            const { url } = request;
            if (url.startsWith(SUCCESS_URL)) {
              setPaymentUrl(null);
              Alert.alert('Payment Successful', 'भुगतान सफल हुआ।');
              return false;
            }
            if (url.startsWith(FAIL_URL)) {
              setPaymentUrl(null);
              Alert.alert('Payment Failed', 'भुगतान विफल हुआ।');
              return false;
            }
            return true;
          }}
          onNavigationStateChange={navState => {
            const { url } = navState;
            if (url.startsWith(SUCCESS_URL)) {
              setPaymentUrl(null);
              Alert.alert('Payment Successful', 'भुगतान सफल हुआ।');
            }
            if (url.startsWith(FAIL_URL)) {
              setPaymentUrl(null);
              Alert.alert('Payment Failed', 'भुगतान विफल हुआ।');
            }
          }}
          javaScriptEnabled
          domStorageEnabled
        />
      </SafeAreaView>
    );
  }

  const validateInputs = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          formData.cardNumber &&
          formData.expiry &&
          formData.cvv &&
          formData.cardName
        );
      case 'upi':
        return formData.upiId;
      case 'netbanking':
        return formData.bankName && formData.accountNumber;
      case 'wallet':
        return formData.walletId;
      default:
        return false;
    }
  };

  const handlePay = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Method', 'कृपया भुगतान विधि चुनें / Please select a payment method.');
      return;
    }
    if (!validateInputs()) {
      Alert.alert(
        'Incomplete Details',
        'सभी जानकारियाँ भरें / Please fill in all required fields.'
      );
      return;
    }
    setIsProcessing(true);
    try {
      // Prepare payload for all selected payment methods
      const payload = {
        customerName: selectedMethod === 'upi'
          ? formData.upiId
          : (selectedMethod === 'card'
              ? formData.cardName
              : selectedMethod === 'netbanking'
                ? formData.bankName
                : formData.walletId),
        amount: plan.price,
        billId: plan.id,
        description: plan.name,
        method: selectedMethod,
      };
      if (selectedMethod === 'upi') {
        payload.vpaId = formData.upiId;
      }
      const resp = await lightSpeedApi.initiateTransaction(payload);
      if (resp.status === 'success' && resp.paymentLink) {
        setPaymentUrl(resp.paymentLink);
      } else {
        Alert.alert('Payment Error', resp.message || 'Failed to initiate payment.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'कुछ गलत हो गया / Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name || plan.label}</Text>
          <Text style={styles.planPrice}>
            ₹{plan.price}/{plan.billingCycle || plan.duration}
          </Text>
        </View>
        <Text style={styles.chooseText}>
          अनुरोध विधि चुनें / Choose a Method
        </Text>
        {/* Method selection */}
        {!selectedMethod && (
          <View style={styles.methodsContainer}>
            {paymentMethods.map(item => {
              const isSelected = selectedMethod === item.id;
              const backgroundColor = isSelected ? item.color : theme.colors.backgroundLight;
              const iconColor = isSelected ? '#fff' : item.color;
              const textColor = isSelected ? '#fff' : theme.colors.textSecondary;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.methodCard, { width: cardWidth, backgroundColor }]}
                  onPress={() => setSelectedMethod(item.id)}
                  activeOpacity={0.8}
                >
                  <Icon name={item.icon} size={36} color={iconColor} />
                  <Text style={[styles.methodText, { color: textColor }]}> {item.name} </Text>
                  {isSelected && (
                    <View style={styles.methodCheck}>
                      <Icon name="check-circle" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {selectedMethod && (
          <TouchableOpacity style={styles.changeMethodBtn} onPress={() => setSelectedMethod(null)}>
            <Text style={styles.changeMethodText}>Change Method</Text>
          </TouchableOpacity>
        )}
        {selectedMethod === 'card' && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={formData.cardNumber}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, cardNumber: text }))
              }
            />
            <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={formData.expiry}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, expiry: text }))
              }
            />
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="CVV"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              secureTextEntry
              value={formData.cvv}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, cvv: text }))
              }
            />
            <Text style={styles.inputLabel}>Name on Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Name on card"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.cardName}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, cardName: text }))
              }
            />
          </View>
        )}
        {selectedMethod === 'upi' && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="example@upi"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.upiId}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, upiId: text }))
              }
            />
          </View>
        )}
        {selectedMethod === 'netbanking' && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter bank name"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.bankName}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, bankName: text }))
              }
            />
            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={formData.accountNumber}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, accountNumber: text }))
              }
            />
          </View>
        )}
        {selectedMethod === 'wallet' && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Wallet ID / Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter wallet ID"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.walletId}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, walletId: text }))
              }
            />
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.payBtn,
          (!validateInputs() || isProcessing) && styles.disabledBtn,
        ]}
        onPress={handlePay}
        disabled={!validateInputs() || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.payBtnText}>Pay Now</Text>
        )}
      </TouchableOpacity>
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
    paddingVertical: theme.spacing.small,
  },
  backBtn: {
    padding: theme.spacing.small,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  placeholder: {
    width: theme.spacing.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.medium,
  },
  planInfo: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  planName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  planPrice: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  chooseText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.large,
  },
  methodCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
    marginBottom: theme.spacing.small,
  },
  selectedMethodCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  methodText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  methodCheck: {
    position: 'absolute',
    top: theme.spacing.small,
    right: theme.spacing.small,
  },
  form: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.small,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  payBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    margin: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFF',
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
  },
  disabledBtn: {
    backgroundColor: theme.colors.inactive,
  },
  changeMethodBtn: {
    alignSelf: 'center',
    marginVertical: theme.spacing.medium,
  },
  changeMethodText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.medium,
    textDecorationLine: 'underline',
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginBottom: theme.spacing.tiny,
  },
});

export default PaymentMethodScreen; 
