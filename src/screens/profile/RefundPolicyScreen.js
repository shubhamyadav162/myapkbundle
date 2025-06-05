import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, StatusBar, View } from 'react-native';
import theme from '../../theme';

const RefundPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={styles.headerContainer.backgroundColor} barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Refund Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>1. Scope and Acceptance</Text>
        <Text style={styles.paragraph}>
          This Refund Policy applies to all users (“Users”) of the Big Show OTT mobile application (“App”), operated by Big Show OTT Pvt. Ltd. ("Company", "we", "our", or "us"). By completing any purchase or availing any subscription through the App, you irrevocably acknowledge and accept the terms herein, including the explicit absence of refund entitlements.
        </Text>
        <Text style={styles.sectionTitle}>2. Definitions</Text>
        <Text style={styles.paragraph}>
          For the purposes of this Policy, “Subscription” refers to any paid service tier, including but not limited to monthly, quarterly, semi-annual, or annual plans. “Purchase” denotes any one-time or recurring payment made via the App for digital content or subscription access.
        </Text>
        <Text style={styles.sectionTitle}>3. Purchase and Subscription</Text>
        <Text style={styles.paragraph}>
          All transactions for content access or service subscriptions are processed through third-party payment gateways, subject to their respective terms. Upon confirmation of payment, subscriptions become active immediately and grant access to premium content until expiration.
        </Text>
        <Text style={styles.sectionTitle}>4. Absolute No-Refund Clause</Text>
        <Text style={styles.paragraph}>
          It is hereby declared that all purchases and subscription fees paid to Big Show OTT are final and non-refundable under any circumstances. You agree that you will not initiate any refund requests, chargebacks, or reversals, whether due to dissatisfaction, technical issues, change of mind, or any other reason whatsoever.
        </Text>
        <Text style={styles.sectionTitle}>5. Chargebacks and Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          In the event of unauthorized transactions, Users must notify their financial institution and contact us immediately. Any chargeback or dispute submission initiated without prior written consent from the Company shall be deemed a breach of this Policy.
        </Text>
        <Text style={styles.sectionTitle}>6. Exceptional Circumstances</Text>
        <Text style={styles.paragraph}>
          The Company retains sole discretion to consider refund requests under extraordinary circumstances, such as demonstrable fraudulent activity or manifest technical failures preventing access to purchased services, subject to rigorous verification procedures.
        </Text>
        <Text style={styles.sectionTitle}>7. Policy Amendments</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify this Refund Policy at any time. Amendments shall take effect upon publication within the App or via email notification. Continued use following publication constitutes acceptance of the revised terms.
        </Text>
        <Text style={styles.sectionTitle}>8. Severability</Text>
        <Text style={styles.paragraph}>
          Should any provision of this Policy be found invalid or unenforceable, such provision shall be severed, and the remaining provisions shall continue in full force and effect.
        </Text>
        <Text style={styles.sectionTitle}>9. Governing Law and Jurisdiction</Text>
        <Text style={styles.paragraph}>
          This Policy and any disputes arising hereunder shall be governed by and construed in accordance with the laws of India. The courts of Mumbai shall have exclusive jurisdiction.
        </Text>
        <Text style={styles.sectionTitle}>10. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions or concerns regarding this Refund Policy, please contact us at:
        </Text>
        <Text style={styles.paragraph}>Email: support@bigshowott.com</Text>
        <Text style={styles.paragraph}>Address: Big Show OTT Pvt. Ltd., Mumbai, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.large,
  },
  headerContainer: {
    backgroundColor: '#B71C1C',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
  },
  headerText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    fontFamily: theme.typography.fontFamily,
  },
  paragraph: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.regular,
    lineHeight: theme.typography.fontSize.large * 1.5,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.typography.fontFamily,
  },
});

export default RefundPolicyScreen; 
