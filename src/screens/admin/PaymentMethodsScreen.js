import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Badge } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../components/common/HeaderBar';
import Sidebar from '../../components/common/Sidebar';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import paymentsApi from '../../api/paymentsApi';
import { DataTable, IconButton } from 'react-native-paper';
import baseTheme from '../../theme';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('payments');

  // Dummy data for development/testing
  const dummyPayments = React.useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    transactionId: `TXN00${i + 1}`,
    userEmail: `user${i + 1}@example.com`,
    amount: (Math.random() * 100).toFixed(2),
    subscriptionDuration: i % 2 === 0 ? 'Monthly' : 'Yearly',
    date: Date.now() - (i + 1) * 86400000,
    method: ['Credit Card', 'PayPal', 'Bank Transfer'][i % 3],
    status: ['Completed', 'Pending', 'Failed'][i % 3],
  })), []);
  const displayPayments = payments.length > 0 ? payments : dummyPayments;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentsApi.getPayments();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // All payments list (no grouping)

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
          <View style={styles.headerRow}>
            <IconButton
              icon="arrow-left"
              size={24}
              color={theme.colors.text}
              onPress={() => navigation.goBack()}
            />
            <Text h4 style={[styles.title, { color: theme.colors.primary, marginLeft: baseTheme.spacing.small }]}>Payments by Method</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <ScrollView horizontal>
              <DataTable style={{ minWidth: '100%' }}>
                <DataTable.Header style={{ backgroundColor: theme.colors.backgroundLight, minHeight: 60 }}>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>Txn ID</DataTable.Title>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>User Email</DataTable.Title>
                  <DataTable.Title numeric style={[styles.headerCell, { color: theme.colors.text }]}>Amount</DataTable.Title>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>Subscription</DataTable.Title>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>Date</DataTable.Title>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>Method</DataTable.Title>
                  <DataTable.Title style={[styles.headerCell, { color: theme.colors.text }]}>Status</DataTable.Title>
                </DataTable.Header>
                {displayPayments.map((p, index) => (
                  <DataTable.Row
                    key={p.transactionId}
                    style={{
                      backgroundColor: index % 2 === 0 ? theme.colors.backgroundLight : theme.colors.background,
                      minHeight: 56,
                    }}
                  >
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{p.transactionId}</DataTable.Cell>
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{p.userEmail}</DataTable.Cell>
                    <DataTable.Cell numeric style={[styles.cell, { color: theme.colors.text }]}>{`$${p.amount}`}</DataTable.Cell>
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{p.subscriptionDuration || 'N/A'}</DataTable.Cell>
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{new Date(p.date).toLocaleString()}</DataTable.Cell>
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{p.method || 'Other'}</DataTable.Cell>
                    <DataTable.Cell style={[styles.cell, { color: theme.colors.text }]}>{p.status}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: baseTheme.spacing.medium },
  methodTitle: { marginTop: baseTheme.spacing.medium, marginBottom: baseTheme.spacing.small, fontWeight: 'bold' },
  methodSection: { marginBottom: baseTheme.spacing.large },
  card: { borderRadius: baseTheme.borderRadius.medium, marginBottom: baseTheme.spacing.medium },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: baseTheme.spacing.small },
  text: {},
  headerCell: {
    fontSize: baseTheme.typography.fontSize.large,
    fontWeight: baseTheme.typography.fontWeight.bold,
    paddingVertical: baseTheme.spacing.small,
  },
  cell: {
    fontSize: baseTheme.typography.fontSize.regular,
    paddingVertical: baseTheme.spacing.small,
  },
});

const PaymentMethodsScreenWithTheme = props => (
  <ThemeProvider>
    <PaymentMethodsScreen {...props} />
  </ThemeProvider>
);

export default PaymentMethodsScreenWithTheme; 
