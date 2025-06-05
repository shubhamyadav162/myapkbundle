import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, StatusBar, View } from 'react-native';
import theme from '../../theme';

const TermsAndConditionsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={styles.headerContainer.backgroundColor} barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Effective Date</Text>
        <Text style={styles.paragraph}>
          These Terms & Conditions are effective as of [Insert Date] and govern all use of the Big Show OTT mobile application (“App”) by you.
        </Text>
        <Text style={styles.sectionTitle}>1. Definitions</Text>
        <Text style={styles.paragraph}>
          In these Terms, “App” refers to the Big Show OTT mobile application; “You” or “User” refers to any individual using the App; “Content” means any audio, video, text, images, or other materials provided through the App.
        </Text>
        <Text style={styles.sectionTitle}>2. Account Registration and Security</Text>
        <Text style={styles.paragraph}>
          To access certain features, you must register for an account. You agree to provide accurate information and keep your credentials confidential. You are responsible for all activities under your account.
        </Text>
        <Text style={styles.sectionTitle}>3. Subscriptions and Payment</Text>
        <Text style={styles.paragraph}>
          Subscription fees are billed in advance on a recurring basis and are non-refundable. You authorize us to charge your chosen payment method for the applicable fees. Failure to pay may result in suspension or termination of your subscription.
        </Text>
        <Text style={styles.sectionTitle}>4. User Obligations</Text>
        <Text style={styles.paragraph}>
          You agree to use the App in compliance with all applicable laws, regulations, and these Terms. Prohibited activities include unauthorized copying, distribution, or modification of Content, and any activity that disrupts the App's functionality.
        </Text>
        <Text style={styles.sectionTitle}>5. Intellectual Property Rights</Text>
        <Text style={styles.paragraph}>
          All rights, title, and interest in the App and its Content are owned by Big Show OTT Pvt. Ltd. or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.
        </Text>
        <Text style={styles.sectionTitle}>6. User-Generated Content</Text>
        <Text style={styles.paragraph}>
          Any content you upload or post through the App (“User Content”) grants us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content in connection with the App's operation.
        </Text>
        <Text style={styles.sectionTitle}>7. Disclaimers and Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The App is provided "as is" without warranties. To the maximum extent permitted by law, Big Show OTT is not liable for any indirect, incidental, or consequential damages arising from your use of the App.
        </Text>
        <Text style={styles.sectionTitle}>8. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless Big Show OTT, its officers, employees, and agents from any claims arising out of your use of the App or violation of these Terms.
        </Text>
        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          We may suspend or terminate your access to the App at any time, with or without cause or notice, if you breach these Terms.
        </Text>
        <Text style={styles.sectionTitle}>10. Governing Law and Jurisdiction</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of India. Any disputes shall be resolved exclusively in the courts of Mumbai.
        </Text>
        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. Significant updates will be communicated via the App or email, and continued use constitutes acceptance.
        </Text>
        <Text style={styles.sectionTitle}>12. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App may contain links to third-party sites. We are not responsible for their content or practices.
        </Text>
        <Text style={styles.sectionTitle}>13. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Our Privacy Policy, incorporated herein by reference, explains how we collect and use your personal information.
        </Text>
        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>For questions or concerns about these Terms, contact us at support@bigshowott.com or:</Text>
        <Text style={styles.paragraph}>Big Show OTT Pvt. Ltd., Mumbai, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  contentContainer: {
    padding: theme.spacing.large,
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

export default TermsAndConditionsScreen; 
