import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, ScrollView, Image } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../../../assets/mainlogoo.png';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// AnimatedButton component for press scaling
const AnimatedButton = ({ children, onPress, style, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={styles.button}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const AuthScreen = ({ navigation }) => {
  const [stage, setStage] = useState('entry'); // entry, email, phone, otp
  const [authMode, setAuthMode] = useState('signin'); // signin or signup

  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // Signup अन्य फ़ील्ड्स: पूरा नाम और फोन नंबर
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  // Phone auth state
  const [phone, setPhone] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [digits, setDigits] = useState(['','','','','','']);
  const inputRefs = useRef([]);
  const [countdown, setCountdown] = useState(0);

  // Tab underline animation
  const underlineAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  // Fade animation for screen transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [stage]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    // Android navigation bar background black and icons dark (invisible)
    if (Platform.OS === 'android') {
      const { setBackgroundColorAsync, setButtonStyleAsync } = require('expo-navigation-bar');
      setBackgroundColorAsync('#000000');
      setButtonStyleAsync('dark');
    }
  }, []);

  const handleEmailAuth = async () => {
    setEmailError('');
    setEmailSuccess('');
    if (authMode === 'signup') {
      // सभी फ़ील्ड्स भरने की जाँच
      if (!fullName || !signupPhone || !email || !password || !confirmPassword) {
        setEmailError('कृपया सभी फ़ील्ड भरें');
        return;
      }
      // पासवर्ड मिलान जाँच
      if (password !== confirmPassword) {
        setEmailError('पासवर्ड मेल नहीं खा रहे');
        return;
      }
    }
    setLoading(true);
    let res;
    if (authMode === 'signin') {
      res = await supabase.auth.signInWithPassword({ email, password });
    } else {
      const emailRedirectTo = AuthSession.makeRedirectUri({ scheme: 'bigshow', useProxy: false });
      res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone: signupPhone },
          emailRedirectTo
        }
      });
    }
    setLoading(false);
    if (res.error) {
      setEmailError(res.error.message);
    } else {
      if (authMode === 'signup') {
        setEmailSuccess('सत्यापन ईमेल भेज दिया गया है, कृपया इनबॉक्स देखें');
      } else {
        // Navigate to main screen through parent navigator
        navigation.replace('Main');
      }
    }
  };

  const handleSendOTP = async () => {
    setOtpError('');
    setOtpSuccess('');
    if (!phone) {
      setOtpError('कृपया फोन नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      setOtpError(error.message);
    } else {
      setStage('otp');
      setCountdown(30);
    }
  };

  const fullOtp = digits.join('');
  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    if (fullOtp.length < 6) {
      setOtpError('कृपया सभी 6 अंक दर्ज करें');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({ phone, token: fullOtp, type: 'sms' });
    setLoading(false);
    if (error) {
      setOtpError(error.message);
    } else {
      setOtpSuccess('सफलतापूर्वक लॉग इन हुआ');
      // उपयोगकर्ता प्रोफ़ाइल को फोन नंबर के साथ अपडेट या बनाएँ
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (!userErr && userData.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          user_id: userData.user.id,
          phone: phone,
        });
        if (profileErr) {
          console.error('Error upserting profile:', profileErr.message);
        }
      }
      // Navigate to main screen through parent navigator
      navigation.replace('Main');
    }
  };

  const handleOtpChange = (text, idx) => {
    const newDigits = [...digits];
    newDigits[idx] = text;
    setDigits(newDigits);
    if (text && idx < 5) {
      inputRefs.current[idx + 1].focus();
    }
  };

  const handleResend = () => {
    setDigits(['','','','','','']);
    handleSendOTP();
  };

  // Handle back navigation between stages
  const handleBack = () => {
    if (stage === 'email' || stage === 'phone') {
      setStage('entry');
    } else if (stage === 'otp') {
      setStage('phone');
    }
  };

  // Google OAuth के लिए फ़ंक्शन
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

  const renderEntry = () => (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <AnimatedButton onPress={() => { setAuthMode('signin'); setStage('email'); }} style={styles.entryButton}>
        <Text style={styles.buttonText}>Sign In / Sign Up</Text>
      </AnimatedButton>
      <TouchableOpacity onPress={signInWithGoogle} style={styles.googleButton} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <FontAwesome name="google" size={24} color="#fff" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmail = () => (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.cardContainer}>
        <View style={styles.tabContainer} onLayout={e => setTabWidth(e.nativeEvent.layout.width / 2)}>
          {['signin','signup'].map(mode => (
            <TouchableOpacity key={mode} style={styles.tab} onPress={() => setAuthMode(mode)}>
              <Text style={[styles.tabText, authMode === mode && styles.tabTextActive]}>                
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View style={[styles.tabUnderline, { transform: [{ translateX: underlineAnim }] }]} />
        </View>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#ccc"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}
          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#ccc"
                keyboardType="phone-pad"
                value={signupPhone}
                onChangeText={setSignupPhone}
              />
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#ccc"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          {emailSuccess ? <Text style={styles.successText}>{emailSuccess}</Text> : null}
          <AnimatedButton onPress={handleEmailAuth} disabled={loading} style={styles.sendButton}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>}
          </AnimatedButton>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );

  const renderPhone = () => (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.phoneContainer}>
        <Ionicons name="call-outline" size={64} color="#FF0000" style={{ marginBottom: 20 }} />
        <Text style={styles.phoneTitle}>Login with Phone</Text>
        <Text style={styles.phoneSubtitle}>Enter your phone number to receive a one-time code</Text>
        <TextInput
          style={[styles.input, styles.phoneInput]}
          placeholder="+1 234 567 890"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <AnimatedButton onPress={handleSendOTP} disabled={loading} style={styles.sendButton}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
        </AnimatedButton>
      </View>
      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
    </KeyboardAvoidingView>
  );

  const renderOtp = () => (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.sectionTitle}>
        OTP sent to {phone.replace(/.(?=.{4})/g, '*')}
      </Text>
      <View style={styles.otpContainer}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={el => inputRefs.current[i] = el}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={d}
            onChangeText={text => handleOtpChange(text, i)}
          />
        ))}
      </View>
      <AnimatedButton onPress={handleVerifyOtp} disabled={loading} style={{ marginTop: 20 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
      </AnimatedButton>
      {countdown > 0
        ? <Text style={styles.countdown}>Resend OTP in {countdown}s</Text>
        : <Text style={styles.resendText} onPress={handleResend}>Resend OTP</Text>
      }
      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
      {otpSuccess ? <Text style={styles.successText}>{otpSuccess}</Text> : null}
    </KeyboardAvoidingView>
  );

  return (
    <>
      <StatusBar style="light" />
      <Animated.View style={{ flex:1, opacity: fadeAnim }}>
        {stage !== 'entry' && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FF0000" />
          </TouchableOpacity>
        )}
        {stage === 'entry' && renderEntry()}
        {stage === 'email' && renderEmail()}
        {stage === 'phone' && renderPhone()}
        {stage === 'otp' && renderOtp()}
      </Animated.View>
    </>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#000', padding:20, alignItems:'center', justifyContent:'center' },
  title: { fontSize:32, color:'#fff', marginBottom:40 },
  entryButton: { width:'100%', marginVertical:10 },
  button: { backgroundColor:'#B00000', paddingVertical:15, borderRadius:12, alignItems:'center', shadowColor:'#000', shadowOpacity:0.5, shadowOffset:{ width:0, height:2 }, shadowRadius:4 },
  buttonText: { color:'#FFFFFF', fontSize:18, fontWeight:'bold' },
  tabContainer: { flexDirection:'row', width:'100%', marginBottom:20, position:'relative' },
  tab: { flex:1, paddingVertical:12, alignItems:'center' },
  tabText: { color:'#ccc', fontSize:16 },
  tabTextActive: { color:'#FF0000', fontWeight:'bold' },
  tabUnderline: { position:'absolute', bottom:0, width:'50%', height:2, backgroundColor:'#B00000' },
  form: { width:'100%' },
  inputContainer: { marginVertical:10 },
  input: { backgroundColor:'#111', color:'#fff', paddingHorizontal:15, paddingVertical:12, borderRadius:8, borderWidth:1, borderColor:'#B00000', width:'100%' },
  errorText: { color:'#B00000', marginTop:5 },
  sectionTitle: { color:'#fff', fontSize:20, marginBottom:20 },
  otpContainer: { flexDirection:'row', justifyContent:'space-between', width:'100%', paddingHorizontal:20 },
  otpInput: { width:40, height:50, backgroundColor:'#111', color:'#fff', textAlign:'center', fontSize:18, borderRadius:8, borderWidth:1, borderColor:'#B00000' },
  countdown: { color:'#ccc', marginTop:15 },
  resendText: { color:'#FF0000', marginTop:15 },
  successText: { color:'#00C851', marginTop:15 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, left: 20, zIndex: 1, padding: 10 },
  logo: { width:200, height:200, resizeMode:'contain', marginBottom:40 },
  phoneContainer: {
    backgroundColor: '#111',
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginVertical: 20,
  },
  phoneTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  phoneSubtitle: { color: '#ccc', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  phoneInput: { width: '100%', marginBottom: 20 },
  sendButton: { width: '100%' },
  cardContainer: {
    backgroundColor: '#111',
    width: '100%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginVertical: 20,
  },
  googleButton: { width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#4285F4', paddingVertical:15, borderRadius:12, marginVertical:10, shadowColor:'#000', shadowOpacity:0.5, shadowOffset:{ width:0, height:2 }, shadowRadius:4 },
  googleButtonText: { color:'#FFFFFF', fontSize:18, marginLeft:10, fontWeight:'bold' },
}); 
