import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImageBunny } from '../../utils/bunnyApi';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import baseTheme from '../../theme';

const SeriesEditScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const docRef = doc(db, 'series', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title);
          setDescription(data.description);
          setThumbnail(data.thumbnailUrl);
          setExistingThumbnail(data.thumbnailUrl);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [id]);

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select thumbnail.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for the series.');
      return;
    }
    setSaving(true);
    try {
      let thumbnailUrl = existingThumbnail;
      if (thumbnail && thumbnail !== existingThumbnail) {
        // optional: delete old thumbnail
        if (existingThumbnail && Platform.OS !== 'web') {
          try { await deleteObject(ref(storage, existingThumbnail)); } catch {};
        }
        if (Platform.OS === 'web') {
          thumbnailUrl = await uploadImageBunny(thumbnail, 'series_thumbnails');
        } else {
          const response = await fetch(thumbnail);
          const blob = await response.blob();
          const fileName = `series_${Date.now()}`;
          const storageRef = ref(storage, `series/${fileName}`);
          await uploadBytes(storageRef, blob);
          thumbnailUrl = await getDownloadURL(storageRef);
        }
      }
      const docRef = doc(db, 'series', id);
      await updateDoc(docRef, { title: title.trim(), description: description.trim(), thumbnailUrl });
      Alert.alert('Success', 'Series updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating series:', error);
      Alert.alert('Error', 'Could not update series. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.text }}>Loading...</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.header, { color: theme.colors.primary }]}>Edit Series</Text>
      
      <Input 
        placeholder="Title" 
        value={title} 
        onChangeText={setTitle} 
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
        leftIcon={{ name: 'edit', type: 'feather', color: theme.colors.primary }} 
      />
      
      <Input 
        placeholder="Description" 
        value={description} 
        onChangeText={setDescription} 
        multiline 
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
        leftIcon={{ name: 'align-left', type: 'feather', color: theme.colors.primary }} 
      />
      
      <Button 
        icon={<Icon name="image" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />} 
        title="Change Thumbnail" 
        onPress={pickThumbnail} 
        containerStyle={styles.button} 
        buttonStyle={{ backgroundColor: theme.colors.primary }}
        titleStyle={{ color: '#FFFFFF' }}
        raised
      />
      
      {thumbnail && (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: thumbnail }} style={styles.preview} />
        </View>
      )}
      
      <Button 
        title={saving ? 'Saving...' : 'Save Changes'} 
        onPress={handleSave} 
        disabled={saving} 
        containerStyle={styles.button} 
        buttonStyle={{ backgroundColor: theme.colors.accent }}
        disabledStyle={{ backgroundColor: theme.colors.inactive }}
        titleStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
        icon={<Icon name="save" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />}
        raised
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: baseTheme.spacing.large,
  },
  container: { 
    padding: baseTheme.spacing.large,
    minHeight: '100%',
  },
  header: { 
    marginBottom: baseTheme.spacing.large, 
    alignSelf: 'center',
    fontSize: 26,
  },
  button: { 
    marginVertical: baseTheme.spacing.medium,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
    marginVertical: baseTheme.spacing.medium,
  },
  preview: { 
    width: '100%', 
    height: 200, 
    borderRadius: baseTheme.borderRadius.medium,
  },
});

const SeriesEditScreenWithTheme = (props) => (
  <ThemeProvider>
    <SeriesEditScreen {...props} />
  </ThemeProvider>
);

export default SeriesEditScreenWithTheme; 
