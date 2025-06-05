import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../theme';

const EditProfileScreen = () => {
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem('userAvatar');
        if (storedAvatar) setAvatar(storedAvatar);
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) setName(storedName);
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) setEmail(storedEmail);
        const storedPhone = await AsyncStorage.getItem('userPhone');
        if (storedPhone) setPhone(storedPhone);
        const storedBio = await AsyncStorage.getItem('userBio');
        if (storedBio) setBio(storedBio);
        const storedNotifications = await AsyncStorage.getItem('enableNotifications');
        if (storedNotifications !== null) setEnableNotifications(JSON.parse(storedNotifications));
        const storedDarkMode = await AsyncStorage.getItem('darkMode');
        if (storedDarkMode !== null) setDarkMode(JSON.parse(storedDarkMode));
      } catch (e) {
        console.log('Failed to load profile data', e);
      }
    })();
  }, []);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission required', 'Permission to access gallery is required!');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets ? result.assets[0].uri : result.uri;
      setAvatar(uri);
      await AsyncStorage.setItem('userAvatar', uri);
    }
  };

  const handleSave = async () => {
    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        return Alert.alert('Error', 'New passwords do not match');
      }
      // TODO: Verify currentPassword and update password via API
    }
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPhone', phone);
      await AsyncStorage.setItem('userBio', bio);
      await AsyncStorage.setItem('enableNotifications', JSON.stringify(enableNotifications));
      await AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Photo */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.backgroundLight }]}>  
                <Ionicons name="camera" size={40} color={theme.colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor={theme.colors.textSecondary}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Bio"
            multiline
            value={bio}
            onChangeText={setBio}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
          />
        </View>
        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
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
  scroll: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.small,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginVertical: theme.spacing.large,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.circular,
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.circular,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.large,
    height: 50,
    paddingHorizontal: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.large,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.large,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default EditProfileScreen; 
