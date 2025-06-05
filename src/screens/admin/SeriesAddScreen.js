import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import { Input, Button, Text, Icon, CheckBox } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import baseTheme from '../../theme';
import { uploadImageBunny } from '../../utils/bunnyApi';

const SeriesAddScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [banner, setBanner] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select thumbnail.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const pickBanner = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select banner.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
    });
    if (!result.canceled) {
      setBanner(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for the series.');
      return;
    }
    setUploading(true);
    try {
      let thumbnailUrl = null;
      let bannerUrl = null;
      if (thumbnail) {
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
      if (banner) {
        if (Platform.OS === 'web') {
          bannerUrl = await uploadImageBunny(banner, 'series_banners');
        } else {
          const responseB = await fetch(banner);
          const blobB = await responseB.blob();
          const fileNameB = `banner_${Date.now()}`;
          const storageRefB = ref(storage, `series_banners/${fileNameB}`);
          await uploadBytes(storageRefB, blobB);
          bannerUrl = await getDownloadURL(storageRefB);
        }
      }
      await addDoc(collection(db, 'series'), {
        title: title.trim(),
        description: description.trim(),
        genre: genre.trim(),
        releaseYear: releaseYear.trim(),
        subscriptionPlan: subscriptionPlan.trim(),
        isFeatured,
        thumbnailUrl,
        bannerUrl,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Series created successfully.');
      navigation.navigate('Series');
    } catch (error) {
      console.error('Error creating series:', error);
      Alert.alert('Error', 'Could not create series. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.header, { color: theme.colors.primary }]}>Add New Series</Text>
      
      <Input
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
        leftIcon={{ name: 'edit', type: 'feather', color: theme.colors.primary }}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
      />
      
      <Input
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        leftIcon={{ name: 'align-left', type: 'feather', color: theme.colors.primary }}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
      />
      
      <Input
        placeholder="Genre"
        value={genre}
        onChangeText={setGenre}
        leftIcon={{ name: 'tag', type: 'feather', color: theme.colors.primary }}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
      />
      
      <Input
        placeholder="Release Year"
        value={releaseYear}
        onChangeText={setReleaseYear}
        keyboardType="numeric"
        leftIcon={{ name: 'calendar', type: 'feather', color: theme.colors.primary }}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
      />
      
      <Input
        placeholder="Subscription Plan"
        value={subscriptionPlan}
        onChangeText={setSubscriptionPlan}
        leftIcon={{ name: 'credit-card', type: 'feather', color: theme.colors.primary }}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.textSecondary}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
      />
      
      <CheckBox
        title="Featured Series"
        checked={isFeatured}
        onPress={() => setIsFeatured(!isFeatured)}
        containerStyle={[styles.checkboxContainer, { backgroundColor: 'transparent' }]}
        textStyle={{ color: theme.colors.text }}
        checkedColor={theme.colors.primary}
        uncheckedColor={theme.colors.textSecondary}
      />
      
      <Button
        icon={<Icon name="image" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />}
        title={thumbnail ? 'Change Thumbnail' : 'Pick Thumbnail'}
        onPress={pickThumbnail}
        containerStyle={styles.button}
        buttonStyle={{ backgroundColor: theme.colors.primary }}
        titleStyle={{ color: '#FFFFFF' }}
        raised
      />
      
      {thumbnail && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: thumbnail }} style={styles.preview} />
        </View>
      )}
      
      <Button
        icon={<Icon name="image" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />}
        title={banner ? 'Change Banner' : 'Pick Banner'}
        onPress={pickBanner}
        containerStyle={styles.button}
        buttonStyle={{ backgroundColor: theme.colors.secondary }}
        titleStyle={{ color: '#FFFFFF' }}
        raised
      />
      
      {banner && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: banner }} style={styles.previewBanner} />
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          type="outline"
          onPress={() => navigation.goBack()}
          containerStyle={[styles.button, styles.cancelButton]}
          buttonStyle={{ borderColor: theme.colors.error }}
          titleStyle={{ color: theme.colors.error }}
          icon={<Icon name="x" type="feather" color={theme.colors.error} style={{ marginRight: 8 }} />}
        />
        
        <Button
          title={uploading ? 'Saving...' : 'Save Series'}
          onPress={handleSave}
          disabled={uploading}
          containerStyle={[styles.button, styles.saveButton]}
          buttonStyle={{ backgroundColor: theme.colors.accent }}
          disabledStyle={{ backgroundColor: theme.colors.inactive }}
          titleStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
          icon={<Icon name="save" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />}
          raised
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  checkboxContainer: {
    borderWidth: 0,
    marginLeft: 0,
    marginBottom: baseTheme.spacing.medium,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: baseTheme.spacing.medium,
  },
  preview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewBanner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: baseTheme.spacing.medium,
  },
  cancelButton: {
    flex: 1,
    marginRight: baseTheme.spacing.small,
  },
  saveButton: {
    flex: 2,
    marginLeft: baseTheme.spacing.small,
  },
});

const SeriesAddScreenWithTheme = (props) => (
  <ThemeProvider>
    <SeriesAddScreen {...props} />
  </ThemeProvider>
);

export default SeriesAddScreenWithTheme; 
