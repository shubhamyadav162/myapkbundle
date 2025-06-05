import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Import theme
import theme from '../../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  // Navigate to login screen
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Navigate to signup screen
  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0)', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Big Show</Text>
          <Text style={styles.tagline}>Unlimited Web Series Streaming</Text>
        </View>
        
        <View style={styles.featureContainer}>
          <ScrollView>
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>Watch Anywhere</Text>
              <Text style={styles.featureDescription}>
                Stream your favorite shows on mobile, tablet, or any device with an internet connection.
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>Download & Watch Offline</Text>
              <Text style={styles.featureDescription}>
                Save your data by downloading episodes to watch on the go, without an internet connection.
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>No Commitments</Text>
              <Text style={styles.featureDescription}>
                Cancel your subscription anytime, no hidden fees or contracts.
              </Text>
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signupButton]} 
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.large,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logo: {
    color: theme.colors.accent,
    fontSize: 48,
    fontWeight: 'bold',
  },
  tagline: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: theme.spacing.small,
  },
  featureContainer: {
    flex: 1,
    marginVertical: theme.spacing.xlarge,
  },
  feature: {
    marginBottom: theme.spacing.large,
  },
  featureTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.small,
  },
  featureDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: theme.spacing.xlarge,
  },
  button: {
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 
