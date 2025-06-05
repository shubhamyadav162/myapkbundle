import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

const PaymentScreen = ({ route, navigation }) => {
  const { plan, period } = route.params;
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handlePurchase = () => {
    if (termsAccepted) {
      // TODO: Implement payment integration
      navigation.replace('Home');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment Information</Text>
      <Text style={styles.summary}>Plan: {plan} ({period})</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          value={cardNumber}
          onChangeText={setCardNumber}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>  
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            placeholderTextColor={theme.colors.textSecondary}
            value={expiry}
            onChangeText={setExpiry}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>  
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            secureTextEntry
            value={cvv}
            onChangeText={setCvv}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setTermsAccepted(!termsAccepted)}>
        <View style={[styles.checkbox, termsAccepted && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]} />
        <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.purchaseButton, !termsAccepted && { opacity: 0.6 }]}
        onPress={handlePurchase}
        disabled={!termsAccepted}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.highlight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Text style={styles.purchaseText}>Complete Purchase</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.header,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  summary: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.medium,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
    marginBottom: theme.spacing.small,
  },
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.medium,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.medium,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    marginRight: theme.spacing.small,
  },
  checkboxLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
  },
  purchaseButton: {
    marginTop: theme.spacing.large,
  },
  gradientButton: {
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  purchaseText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default PaymentScreen; 
