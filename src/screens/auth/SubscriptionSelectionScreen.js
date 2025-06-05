import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

const plans = [
  { id: 'basic', name: 'Basic', priceMonthly: '$5.99', priceAnnual: '$59.99', features: ['SD quality', '1 device'] },
  { id: 'standard', name: 'Standard', priceMonthly: '$9.99', priceAnnual: '$99.99', features: ['HD quality', '2 devices'] },
  { id: 'premium', name: 'Premium', priceMonthly: '$14.99', priceAnnual: '$149.99', features: ['4K quality', '4 devices', 'Downloads'] },
];

const SubscriptionSelectionScreen = ({ navigation }) => {
  const [period, setPeriod] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleContinue = () => {
    if (selectedPlan) {
      navigation.navigate('Payment', { plan: selectedPlan, period });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Cancel anytime</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, period === 'monthly' && styles.toggleActive]}
          onPress={() => setPeriod('monthly')}
        >
          <Text style={[styles.toggleText, period === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, period === 'annual' && styles.toggleActive]}
          onPress={() => setPeriod('annual')}
        >
          <Text style={[styles.toggleText, period === 'annual' && styles.toggleTextActive]}>Annual</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.plansContainer}>
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => navigation.navigate('Payment', { plan: plan.id, period })}
            >
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{period === 'monthly' ? plan.priceMonthly : plan.priceAnnual}</Text>
              {plan.features.map((feat, idx) => (
                <Text key={idx} style={styles.planFeature}>• {feat}</Text>
              ))}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.large,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.header,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: theme.spacing.large,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
  },
  toggleButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.xlarge,
  },
  toggleText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
  },
  toggleActive: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
  },
  toggleTextActive: {
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.bold,
  },
  plansContainer: {
    paddingVertical: theme.spacing.medium,
  },
  planCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  planCardSelected: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  planName: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  planPrice: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  planFeature: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
});

export default SubscriptionSelectionScreen; 
