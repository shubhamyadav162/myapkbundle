import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Input, Badge } from 'react-native-elements';
import { Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../components/common/HeaderBar';
import Sidebar from '../../components/common/Sidebar';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import paymentsApi from '../../api/paymentsApi';
import baseTheme from '../../theme';

const periods = ['Today', 'This Week', 'This Month', 'This Year', 'All'];

const PaymentManagementScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('payments');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentsApi.getPayments();
        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filterByPeriod = (list, period) => {
    const now = new Date();
    return list.filter(p => {
      const date = new Date(p.date);
      switch (period) {
        case 'Today':
          return date.toDateString() === now.toDateString();
        case 'This Week': {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return date >= weekAgo && date <= now;
        }
        case 'This Month':
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'This Year':
          return date.getFullYear() === now.getFullYear();
        case 'All':
        default:
          return true;
      }
    });
  };

  const calculateRevenue = (period) => {
    const filtered = filterByPeriod(payments, period);
    return filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2);
  };

  const filteredPayments = filterByPeriod(payments, selectedPeriod).filter(p => {
    if (!searchQuery) return true;
    return (
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <HeaderBar
        onToggleTheme={toggleTheme}
        isDarkMode={theme.dark}
        notificationCount={0}
        onLogout={() => {}}
        onSettings={() => {}}
      />
      <View style={styles.body}>
        <Sidebar
          navigation={navigation}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <ScrollView style={styles.content} contentContainerStyle={{ padding: baseTheme.spacing.large }}>
          <Text h4 style={[styles.title, { color: theme.colors.primary }]}>Payment Management</Text>
          <View style={styles.summaryContainer}>
            {periods.slice(0, 4).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.colors.backgroundLight },
                  selectedPeriod === period && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>{period}</Text>
                <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>${calculateRevenue(period)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            placeholder="Search by ID or Email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={{ type: 'ionicon', name: 'search', color: theme.colors.textSecondary }}
            inputStyle={{ color: theme.colors.text }}
            placeholderTextColor={theme.colors.textSecondary}
            containerStyle={styles.searchContainer}
          />
          <View style={styles.chipContainer}>
            {periods.map(period => (
              <Chip
                key={period}
                mode={selectedPeriod === period ? 'flat' : 'outlined'}
                onPress={() => setSelectedPeriod(period)}
                style={selectedPeriod === period ? styles.chipActive : styles.chip}
                textStyle={{ color: selectedPeriod === period ? theme.colors.white : theme.colors.text }}
              >
                {period}
              </Chip>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.viewMethodsButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.push('PaymentMethods')}
          >
            <Text style={[styles.viewMethodsButtonText, { color: theme.colors.white }]}>View by Payment Method</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            filteredPayments.map(p => (
              <Card
                key={p.transactionId}
                containerStyle={[styles.transactionCard, { backgroundColor: theme.colors.backgroundLight }]}
              >
                <View style={styles.transactionRow}>
                  <Text style={[styles.transactionId, { color: theme.colors.text }]}>ID: {p.transactionId}</Text>
                  <Badge
                    value={p.status}
                    status={p.status === 'Paid' ? 'success' : 'warning'}
                  />
                </View>
                <View style={styles.transactionRow}>
                  <Text style={[styles.transactionText, { color: theme.colors.textSecondary }]}>{p.userEmail}</Text>
                  <Text style={[styles.transactionAmount, { color: theme.colors.success }]}>${p.amount}</Text>
                </View>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {new Date(p.date).toLocaleString()}
                </Text>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  title: { marginBottom: baseTheme.spacing.large, alignSelf: 'center' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: baseTheme.spacing.large },
  summaryCard: { flex: 1, alignItems: 'center', padding: baseTheme.spacing.medium, marginHorizontal: baseTheme.spacing.small, borderRadius: baseTheme.borderRadius.medium },
  summaryTitle: { fontWeight: 'bold', marginBottom: baseTheme.spacing.small },
  summaryAmount: { fontWeight: 'bold', fontSize: baseTheme.typography.fontSize.large },
  searchContainer: { marginBottom: baseTheme.spacing.medium },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: baseTheme.spacing.large },
  chip: { marginRight: baseTheme.spacing.small, borderColor: baseTheme.colors.border },
  chipActive: { marginRight: baseTheme.spacing.small, backgroundColor: baseTheme.colors.primary, borderColor: baseTheme.colors.primary },
  transactionCard: { borderRadius: baseTheme.borderRadius.medium, marginBottom: baseTheme.spacing.medium },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: baseTheme.spacing.small },
  transactionId: { fontWeight: 'bold' },
  transactionText: {},
  transactionAmount: { fontWeight: 'bold' },
  transactionDate: { marginTop: baseTheme.spacing.tiny, fontSize: baseTheme.typography.fontSize.small },
  viewMethodsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: baseTheme.spacing.medium,
    marginBottom: baseTheme.spacing.large,
    borderRadius: baseTheme.borderRadius.medium,
  },
  viewMethodsButtonText: {
    fontWeight: 'bold',
    fontSize: baseTheme.typography.fontSize.regular,
  },
});

const PaymentManagementScreenWithTheme = (props) => (
  <ThemeProvider>
    <PaymentManagementScreen {...props} />
  </ThemeProvider>
);

export default PaymentManagementScreenWithTheme; 
