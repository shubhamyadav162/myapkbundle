import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import authApi from '../../api/authApi';
import usersApi from '../../api/usersApi';

export default function SignupScreen(props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signOut } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await authApi.register(email, password, name);
      if (res.success) {
        // Create Firestore user profile
        await usersApi.createUserProfile({ uid: res.data.uid, email: res.data.email, name });
        // Sign out unverified user to prevent auto-login
        await signOut();
        // Notify user to verify email
        Alert.alert(
          'Signup Successful',
          'Verification email sent. Please check your inbox and verify your email before logging in.'
        );
        props.navigation.navigate('Login');
      } else {
        Alert.alert('Signup Error', res.error);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#121212']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Please fill the details to create a new account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#999999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999999"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#999999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.highlight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 1,
  },
  header: {
    marginTop: 40,
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
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.large,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  gradientButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.large,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 
