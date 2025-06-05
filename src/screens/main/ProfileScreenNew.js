import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import AuthContext from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '', phone: '' });
  const defaultAvatar = 'https://source.unsplash.com/random/200x200?face';
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      try {
        const uri = await AsyncStorage.getItem('userAvatar');
        if (uri) setAvatarUri(uri);
      } catch (e) {
        console.log('Failed to load avatar', e);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        console.error('Error fetching user:', userErr);
        return;
      }
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('user_id', userData.user.id)
        .single();
      if (profileErr) {
        console.error('Error fetching profile:', profileErr.message);
        return;
      }
      setProfile(profileData);
      if (profileData.avatar_url) {
        setAvatarUri(profileData.avatar_url);
      }
    };
    fetchProfile();
  }, []);

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access gallery is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled === false) {
        // handle both new and old response shapes
        const uri = result.assets?.[0]?.uri ?? result.uri;
        if (uri) {
          setAvatarUri(uri);
          await AsyncStorage.setItem('userAvatar', uri);
        }
      }
    } catch (e) {
      console.log('Error selecting image:', e);
      Alert.alert('Error', 'Unable to select image. Please try again.');
    }
  };

  const user = { name: 'John Doe', avatar: avatarUri };
  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={theme.colors.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleSelectImage}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{profile.full_name || user.name}</Text>
          {profile.phone ? <Text style={styles.phone}>{profile.phone}</Text> : null}
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('EditProfile')}>
          <Ionicons name="person-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('Subscription')}>
          <Ionicons name="card-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Subscription</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('PrivacyPolicy')}>
          <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('RefundPolicy')}>
          <Ionicons name="cash-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Refund Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => handleNavigate('TermsConditions')}>
          <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutButton]} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.settingIcon} />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  phone: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.regular,
    marginTop: theme.spacing.small,
  },
  scrollContent: {
    padding: theme.spacing.large,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.accent,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.large,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
  },
  settingIcon: {
    marginRight: theme.spacing.medium,
  },
  settingText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.regular,
  },
  logoutButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.large,
  },
});

export default ProfileScreen; 
