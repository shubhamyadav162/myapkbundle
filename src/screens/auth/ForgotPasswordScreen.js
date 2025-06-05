import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // TODO: Implement actual password reset logic
    Alert.alert(
      'Email Sent',
      `Password reset instructions have been sent to ${email}`,
      [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen') }]
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#121212']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#999999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToLogin}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 36,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -80,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.large,
    height: 54,
    paddingHorizontal: theme.spacing.medium,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ForgotPasswordScreen; 
