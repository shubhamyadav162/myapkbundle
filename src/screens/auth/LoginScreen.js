import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from 'react-native-rapi-ui';
import * as NavigationBar from 'expo-navigation-bar';

export default function LoginScreen({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTheme('dark');
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(themeColor.dark);
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  async function login() {
    setLoading(true);
    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });
    if (!error && !user) {
      setLoading(false);
      alert('Check your email for the login link!');
    }
    if (error) {
      setLoading(false);
      alert(error.message);
    } else if (user) {
      navigation.navigate('MainTabs');
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      // Use custom app scheme for OAuth redirect
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'bigshow', useProxy: false });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (err) {
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: themeColor.dark,
            }}
          >
            <Image
              resizeMode="contain"
              style={{ height: 220, width: 220 }}
              source={require('../../../assets/images/login.png')}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: themeColor.dark,
            }}
          >
            <Text fontWeight="bold" size="h3" style={{ alignSelf: 'center', padding: 30, color: themeColor.white100 }}>
              Login
            </Text>
            <Text style={{ color: themeColor.white100 }}>Email</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              inputContainerStyle={{ backgroundColor: themeColor.dark, borderColor: themeColor.dark }}
              inputStyle={{ color: themeColor.white100 }}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />

            <Text style={{ marginTop: 15, color: themeColor.white100 }}>Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              inputContainerStyle={{ backgroundColor: themeColor.dark, borderColor: themeColor.dark }}
              inputStyle={{ color: themeColor.white100 }}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            <Button
              text={loading ? 'Loading' : 'Continue'}
              onPress={login}
              style={{ marginTop: 20 }}
              disabled={loading}
            />

            {/* Continue with Google button */}
            <Button
              text={loading ? 'Loading' : 'Continue with Google'}
              onPress={signInWithGoogle}
              style={{ marginTop: 20, backgroundColor: '#4285F4' }}
              disabled={loading}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, justifyContent: 'center' }}>
              <Text size="md" style={{ color: themeColor.white100 }}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text size="md" fontWeight="bold" style={{ marginLeft: 5, color: themeColor.white100 }}>
                  Register here
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text size="md" fontWeight="bold" style={{ color: themeColor.white100 }}>
                  Forget password
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
      <StatusBar style="light" backgroundColor={themeColor.dark} />
    </KeyboardAvoidingView>
  );
} 
