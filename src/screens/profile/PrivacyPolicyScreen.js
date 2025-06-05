import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, StatusBar, View } from 'react-native';
import theme from '../../theme';

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={styles.headerContainer.backgroundColor} barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          At Big Show OTT, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (“App”).
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect the following types of information: Account Information (name, email), Payment Information (credit card details processed via trusted payment gateways), Usage Data (viewing history, search queries, preferences), Device Information (device type, operating system), and Cookies & Tracking Data.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use collected data to provide and maintain our Service, process transactions, improve user experience, personalize content and recommendations, communicate updates and promotions, and comply with legal obligations.
        </Text>

        <Text style={styles.sectionTitle}>4. Information Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal data. We may share information with Service Providers (payment processors, analytics), Legal Authorities (if required), and Affiliates under strict confidentiality. We ensure third parties adhere to privacy standards.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our App is not directed to children under 13. We do not knowingly collect data from children under 13. If you believe we have collected such data, please contact us to delete it.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, update, or delete your personal information. To exercise these rights, contact us at privacy@bigshowott.com.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy periodically. We will notify you of significant changes via the App or email.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>If you have questions or concerns about this Privacy Policy, please contact us at:</Text>
        <Text style={styles.paragraph}>Email: privacy@bigshowott.com</Text>
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

export default PrivacyPolicyScreen; 
