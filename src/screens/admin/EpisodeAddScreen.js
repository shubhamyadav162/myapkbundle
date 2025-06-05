import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Image, Alert, Platform } from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { uploadImageBunny } from '../../utils/bunnyApi';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import baseTheme from '../../theme';

const EpisodeAddScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { seriesId } = route.params;
  const { theme } = useTheme();
  const [episodes, setEpisodes] = useState([
    { title: '', description: '', thumbnailUri: null }
  ]);
  const [uploading, setUploading] = useState(false);

  const addField = () => setEpisodes([...episodes, { title: '', description: '', thumbnailUri: null }]);
  const removeField = index => setEpisodes(episodes.filter((_, i) => i !== index));

  const pickThumbnail = async index => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select thumbnail.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const list = [...episodes];
      list[index].thumbnailUri = uri;
      setEpisodes(list);
    }
  };

  const handleInput = (index, field, value) => {
    const list = [...episodes];
    list[index][field] = value;
    setEpisodes(list);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      for (const ep of episodes) {
        if (!ep.title.trim()) {
          throw new Error('Each episode must have a title.');
        }
        let thumbnailUrl = null;
        if (ep.thumbnailUri) {
          if (Platform.OS === 'web') {
            thumbnailUrl = await uploadImageBunny(ep.thumbnailUri, 'episode_thumbnails');
          } else {
            const response = await fetch(ep.thumbnailUri);
            const blob = await response.blob();
            const fileName = `episode_${Date.now()}`;
            const storageRef = ref(storage, `episodes/${fileName}`);
            await uploadBytes(storageRef, blob);
            thumbnailUrl = await getDownloadURL(storageRef);
          }
        }
        await addDoc(collection(db, 'episodes'), {
          seriesId,
          title: ep.title.trim(),
          description: ep.description.trim(),
          thumbnailUrl,
          createdAt: serverTimestamp(),
        });
      }
      Alert.alert('Success', 'Episodes added successfully.');
      navigation.navigate('Episodes', { seriesId });
    } catch (error) {
      console.error('Error adding episodes:', error);
      Alert.alert('Error', error.message || 'Could not add episodes.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.header, { color: theme.colors.primary }]}>Add Episodes</Text>
      
      {episodes.map((ep, index) => (
        <View key={index} style={[styles.fieldContainer, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.fieldHeader}>
            <Text style={[styles.fieldTitle, { color: theme.colors.text }]}>Episode {index + 1}</Text>
            {episodes.length > 1 && (
              <Icon 
                name="trash-2" 
                type="feather" 
                color={theme.colors.error} 
                onPress={() => removeField(index)} 
                containerStyle={styles.deleteIcon}
              />
            )}
          </View>
          
          <Input 
            placeholder="Title" 
            value={ep.title} 
            onChangeText={val => handleInput(index, 'title', val)} 
            inputStyle={{ color: theme.colors.text }}
            placeholderTextColor={theme.colors.textSecondary}
            inputContainerStyle={{ borderBottomColor: theme.colors.border }}
            leftIcon={{ name: 'edit', type: 'feather', color: theme.colors.primary }}
          />
          
          <Input 
            placeholder="Description" 
            value={ep.description} 
            onChangeText={val => handleInput(index, 'description', val)} 
            multiline 
            inputStyle={{ color: theme.colors.text }}
            placeholderTextColor={theme.colors.textSecondary}
            inputContainerStyle={{ borderBottomColor: theme.colors.border }}
            leftIcon={{ name: 'align-left', type: 'feather', color: theme.colors.primary }}
          />
          
          <Button
            icon={<Icon name="image" type="feather" color="#FFFFFF" style={{ marginRight: 8 }} />}
            title={ep.thumbnailUri ? 'Change Thumbnail' : 'Pick Thumbnail'}
            onPress={() => pickThumbnail(index)}
            containerStyle={styles.button}
            buttonStyle={{ backgroundColor: theme.colors.primary }}
            titleStyle={{ color: '#FFFFFF' }}
            raised
          />
          
          {ep.thumbnailUri && (
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: ep.thumbnailUri }} style={styles.preview} />
            </View>
          )}
        </View>
      ))}
      
      <Button
        icon={<Icon name="plus" type="feather" color={theme.colors.primary} style={{ marginRight: 8 }} />}
        title="Add Another Episode"
        type="outline"
        onPress={addField}
        containerStyle={styles.button}
        buttonStyle={{ borderColor: theme.colors.primary }}
        titleStyle={{ color: theme.colors.primary }}
      />
      
      <Button
        title={uploading ? 'Saving...' : 'Save Episodes'}
        onPress={handleSave}
        disabled={uploading}
        containerStyle={[styles.button, styles.saveButton]}
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
  container: { 
    padding: baseTheme.spacing.large, 
    minHeight: '100%',
  },
  header: { 
    marginBottom: baseTheme.spacing.large, 
    alignSelf: 'center',
    fontSize: 26,
  },
  fieldContainer: { 
    marginBottom: baseTheme.spacing.large, 
    borderBottomWidth: 1, 
    paddingBottom: baseTheme.spacing.large,
  },
  fieldHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: baseTheme.spacing.medium,
  },
  fieldTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
  },
  deleteIcon: {
    padding: baseTheme.spacing.small,
  },
  button: { 
    marginVertical: baseTheme.spacing.medium,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  saveButton: {
    marginTop: baseTheme.spacing.large,
  },
  thumbnailContainer: {
    borderWidth: 1,
    borderColor: baseTheme.colors.border,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
    marginTop: baseTheme.spacing.small,
  },
  preview: { 
    width: '100%', 
    height: 200, 
    borderRadius: baseTheme.borderRadius.medium,
  },
});

const EpisodeAddScreenWithTheme = (props) => (
  <ThemeProvider>
    <EpisodeAddScreen {...props} />
  </ThemeProvider>
);

export default EpisodeAddScreenWithTheme; 
