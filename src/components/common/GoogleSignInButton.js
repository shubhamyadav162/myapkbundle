import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

// Ensure WebBrowser is configured to handle the auth session
WebBrowser.maybeCompleteAuthSession();

// Get proper config based on Expo SDK version
const getExpoConfig = () => {
  // For Expo SDK 46 and above
  if (Constants.expoConfig) {
    return Constants.expoConfig;
  }
  
  // For Expo SDK 45 and below
  return Constants.manifest;
};

const GoogleSignInButton = ({ onSignInComplete, buttonStyle, textStyle }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Get config with fallbacks to multiple possible naming conventions
  const expoConfig = getExpoConfig();
  const extra = expoConfig?.extra || {};
  
  // Get client IDs from config
  const androidClientId = extra.androidClientId || extra.GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.webClientId || extra.GOOGLE_WEB_CLIENT_ID;
  
  // If client IDs are missing, set error and disable button
  const configError = !androidClientId || !webClientId;
  React.useEffect(() => {
    if (configError) {
      setError('Google Sign-In is not configured properly. Please contact support.');
    }
  }, [configError]);

  // Log config for debugging
  console.log('Google Sign-In Config:', { 
    androidClientId,
    webClientId,
    extraKeys: Object.keys(extra)
  });

  // Configure Google authentication, using Expo proxy by default
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      androidClientId,
      webClientId,
      // iosClientId: extra.iosClientId || extra.GOOGLE_IOS_CLIENT_ID, // add if you have an iOS OAuth client
    }
  );

  React.useEffect(() => {
    // Handle the authentication response
    if (response?.type === 'success') {
      setLoading(true);
      const { id_token } = response.params;
      
      // Create a Google credential with the token
      const credential = GoogleAuthProvider.credential(id_token);
      
      // Sign in with Firebase using the Google credential
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log('Google sign-in successful');
          if (onSignInComplete) {
            onSignInComplete(result.user);
          }
        })
        .catch((error) => {
          console.error('Error signing in with Google:', error);
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      console.error('Google Sign-In error:', response.error);
      setError(response.error?.message || 'Google Sign-In failed');
    }
  }, [response, onSignInComplete]);

  const handlePress = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error starting Google sign-in:', error);
      setError(error.message || 'Failed to start Google Sign-In');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, buttonStyle, configError && { backgroundColor: '#888' }]}
        onPress={handlePress}
        disabled={loading || !request || configError}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            <FontAwesome name="google" size={24} color="#ffffff" />
            <Text style={[styles.buttonText, textStyle]}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, { fontWeight: 'bold', fontSize: 14 }]}>{error}</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  }
});

export default GoogleSignInButton; 
