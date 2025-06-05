import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Text, 
  Button, 
  Input, 
  Icon, 
  Card, 
  Divider,
  CheckBox
} from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../theme';
import { db, storage } from '../../utils/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query,
  where
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import HeaderBar from '../../components/common/HeaderBar';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import Sidebar from '../../components/common/Sidebar';
import { uploadImageBunny, createVideoMeta, uploadVideoBunny, getPlaybackUrlBunny } from '../../utils/bunnyApi';

const ContentManagementScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme, theme: appTheme } = useTheme();
  // refs to keep focus on web inputs
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const genreInputRef = useRef(null);
  const yearInputRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const [activeSection, setActiveSection] = useState('content');

  // States for series
  const [activeView, setActiveView] = useState('seriesList'); // seriesList, addSeries, viewSeries
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States for managing series
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesGenre, setSeriesGenre] = useState('');
  const [seriesThumbnail, setSeriesThumbnail] = useState(null);
  const [seriesBanner, setSeriesBanner] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [releaseYear, setReleaseYear] = useState('');

  // States for episodes
  const [episodes, setEpisodes] = useState([]);
  const [newEpisode, setNewEpisode] = useState({
    title: '', 
    description: '', 
    thumbnailUri: null,
    videoUri: null,
    episodeNumber: 1,
    duration: '',
    playbackUrl: ''
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'series'));
      const series = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeriesList(series);
    } catch (error) {
      console.error('Error fetching series:', error);
      Alert.alert('Error', 'Failed to load series data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (seriesId) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'episodes'), where('seriesId', '==', seriesId));
      const snapshot = await getDocs(q);
      const episodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEpisodes(episodes);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      Alert.alert('Error', 'Failed to load episodes data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9]
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const pickVideo = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is required to select video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Videos,
      quality: 0.8,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, path) => {
    if (!uri) return null;
    
    try {
      if (Platform.OS === 'web') {
        return await uploadImageBunny(uri, path);
      }
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${path}_${Date.now()}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const saveSeries = async () => {
    if (!seriesTitle.trim()) {
      Alert.alert('Validation', 'Please enter a title for the series');
      return;
    }

    setLoading(true);
    try {
      // Upload thumbnail and banner (Bunny on web)
      const thumbnailUrl = await uploadImage(seriesThumbnail, 'series_thumbnails');
      const bannerUrl = await uploadImage(seriesBanner, 'series_banners');

      // Create series document
      await addDoc(collection(db, 'series'), {
        title: seriesTitle.trim(),
        description: seriesDescription.trim(),
        genre: seriesGenre.trim(),
        thumbnailUrl,
        bannerUrl,
        isFeatured,
        releaseYear: releaseYear.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      Alert.alert('Success', 'Series created successfully');
      resetSeriesForm();
      fetchSeries();
      setActiveView('seriesList');
    } catch (error) {
      console.error('Error creating series:', error);
      Alert.alert('Error', 'Failed to create series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveEpisode = async () => {
    if (!newEpisode.title.trim() || !selectedSeriesId) {
      Alert.alert('Validation', 'Please enter a title for the episode');
      return;
    }

    setLoading(true);
    try {
      // Upload thumbnail
      const thumbnailUrl = await uploadImage(newEpisode.thumbnailUri, 'episode_thumbnails');
      // Upload video via Bunny on web, else use provided playbackUrl or static URL
      let playbackUrl = newEpisode.playbackUrl;
      if (Platform.OS === 'web' && newEpisode.videoUri) {
        const { Id, UploadUrl } = await createVideoMeta({ Title: newEpisode.title.trim(), Description: newEpisode.description.trim() });
        await uploadVideoBunny(UploadUrl, newEpisode.videoUri);
        playbackUrl = await getPlaybackUrlBunny(Id);
      }
      // Create episode document
      await addDoc(collection(db, 'episodes'), {
        seriesId: selectedSeriesId,
        title: newEpisode.title.trim(),
        description: newEpisode.description.trim(),
        thumbnailUrl,
        videoUrl: playbackUrl,
        episodeNumber: Number(newEpisode.episodeNumber) || 1,
        duration: newEpisode.duration.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form and refresh episodes
      setNewEpisode({
        title: '', 
        description: '', 
        thumbnailUri: null,
        videoUri: null,
        playbackUrl: '',
        episodeNumber: episodes.length + 1,
        duration: ''
      });
      fetchEpisodes(selectedSeriesId);
      Alert.alert('Success', 'Episode added successfully');
    } catch (error) {
      console.error('Error adding episode:', error);
      Alert.alert('Error', 'Failed to add episode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSeriesForm = () => {
    setSeriesTitle('');
    setSeriesDescription('');
    setSeriesGenre('');
    setSeriesThumbnail(null);
    setSeriesBanner(null);
    setIsFeatured(false);
    setReleaseYear('');
  };

  const viewSeries = (series) => {
    setSelectedSeriesId(series.id);
    fetchEpisodes(series.id);
    setActiveView('viewSeries');
  };

  const SeriesListView = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerWithActions}>
        <Text h4 style={styles.headerText}>Series Management</Text>
        <Button
          icon={<Icon name="plus" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
          title="Add New Series"
          onPress={() => setActiveView('addSeries')}
          buttonStyle={styles.primaryButton}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView>
          {seriesList.length === 0 ? (
            <Text style={styles.emptyText}>No series found. Create your first series!</Text>
          ) : (
            seriesList.map((series) => (
              <Card key={series.id} containerStyle={styles.seriesCard}>
                <View style={styles.seriesCardContent}>
                  <Image 
                    source={{ uri: series.thumbnailUrl || 'https://via.placeholder.com/150' }} 
                    style={styles.seriesThumbnail} 
                  />
                  <View style={styles.seriesInfo}>
                    <Text style={styles.seriesTitle}>{series.title}</Text>
                    <Text style={styles.seriesDescription} numberOfLines={2}>
                      {series.description || 'No description'}
                    </Text>
                    {series.genre && (
                      <Text style={styles.seriesGenre}>Genre: {series.genre}</Text>
                    )}
                    {series.releaseYear && (
                      <Text style={styles.seriesReleaseYear}>Released: {series.releaseYear}</Text>
                    )}
                    {series.isFeatured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredText}>Featured</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Divider style={styles.cardDivider} />
                <View style={styles.cardActions}>
                  <Button
                    icon={<Icon name="eye" type="feather" color="#fff" size={16} />}
                    title="View & Manage"
                    onPress={() => viewSeries(series)}
                    buttonStyle={[styles.actionButton, styles.viewButton]}
                  />
                  <Button
                    icon={<Icon name="edit-2" type="feather" color="#fff" size={16} />}
                    title="Edit"
                    onPress={() => navigation.navigate('SeriesEdit', { id: series.id })}
                    buttonStyle={[styles.actionButton, styles.editButton]}
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );

  const AddSeriesView = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerWithActions}>
        <Text h4 style={styles.headerText}>Add New Series</Text>
        <Button
          icon={<Icon name="arrow-left" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
          title="Back to Series"
          onPress={() => setActiveView('seriesList')}
          buttonStyle={styles.secondaryButton}
        />
      </View>

      <ScrollView
        style={styles.formContainer}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
      >
        <Input
          ref={titleInputRef}
          label="Series Title *"
          placeholder="Enter series title"
          value={seriesTitle}
          onChangeText={setSeriesTitle}
          leftIcon={<Icon name="edit-3" type="feather" size={24} color="#555" />}
          containerStyle={styles.inputContainer}
        />

        <Input
          ref={descriptionInputRef}
          label="Description"
          placeholder="Enter series description"
          value={seriesDescription}
          onChangeText={setSeriesDescription}
          multiline
          numberOfLines={4}
          blurOnSubmit={false}
          leftIcon={<Icon name="align-left" type="feather" size={24} color="#555" />}
          containerStyle={styles.inputContainer}
          inputStyle={styles.textArea}
        />

        <Input
          ref={genreInputRef}
          blurOnSubmit={false}
          label="Genre"
          placeholder="E.g., Action, Comedy, Drama"
          value={seriesGenre}
          onChangeText={setSeriesGenre}
          leftIcon={<Icon name="film" type="feather" size={24} color="#555" />}
          containerStyle={styles.inputContainer}
        />

        <Input
          ref={yearInputRef}
          blurOnSubmit={false}
          label="Release Year"
          placeholder="E.g., 2023"
          value={releaseYear}
          onChangeText={setReleaseYear}
          keyboardType="numeric"
          leftIcon={<Icon name="calendar" type="feather" size={24} color="#555" />}
          containerStyle={styles.inputContainer}
        />

        <CheckBox
          title="Featured Series"
          checked={isFeatured}
          onPress={() => setIsFeatured(!isFeatured)}
          containerStyle={styles.checkboxContainer}
        />

        <View style={styles.imageSelectionContainer}>
          <Text style={styles.imageLabel}>Thumbnail Image</Text>
          <Button
            icon={<Icon name="image" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
            title={seriesThumbnail ? "Change Thumbnail" : "Select Thumbnail"}
            onPress={() => pickImage(setSeriesThumbnail)}
            buttonStyle={styles.imageButton}
            containerStyle={styles.imageButtonContainer}
          />
          {seriesThumbnail && (
            <Image source={{ uri: seriesThumbnail }} style={styles.selectedImage} />
          )}
        </View>

        <View style={styles.imageSelectionContainer}>
          <Text style={styles.imageLabel}>Banner Image (16:9 ratio recommended)</Text>
          <Button
            icon={<Icon name="image" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
            title={seriesBanner ? "Change Banner" : "Select Banner"}
            onPress={() => pickImage(setSeriesBanner)}
            buttonStyle={styles.imageButton}
            containerStyle={styles.imageButtonContainer}
          />
          {seriesBanner && (
            <Image source={{ uri: seriesBanner }} style={styles.selectedBanner} />
          )}
        </View>

        <Button
          title={loading ? "Saving..." : "Save Series"}
          onPress={saveSeries}
          disabled={loading || !seriesTitle.trim()}
          buttonStyle={styles.saveButton}
          containerStyle={styles.saveButtonContainer}
          icon={<Icon name="check" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
        />
      </ScrollView>
    </View>
  );

  const ViewSeriesView = () => {
    const series = seriesList.find(s => s.id === selectedSeriesId);
    
    if (!series) {
      return (
        <View style={styles.contentContainer}>
          <Text>Series not found</Text>
          <Button 
            title="Back to Series List" 
            onPress={() => setActiveView('seriesList')}
            buttonStyle={styles.secondaryButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerWithActions}>
          <Text h4 style={styles.headerText}>Managing: {series.title}</Text>
          <Button
            icon={<Icon name="arrow-left" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
            title="Back to Series"
            onPress={() => setActiveView('seriesList')}
            buttonStyle={styles.secondaryButton}
          />
        </View>

        <ScrollView>
          {/* Series Info Card */}
          <Card containerStyle={styles.detailCard}>
            <Card.Title h4>Series Details</Card.Title>
            <Card.Divider />
            
            <View style={styles.seriesDetailRow}>
              {series.thumbnailUrl && (
                <Image source={{ uri: series.thumbnailUrl }} style={styles.detailThumbnail} />
              )}
              
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>{series.title}</Text>
                <Text style={styles.detailDescription}>{series.description}</Text>
                
                <View style={styles.detailMetadata}>
                  {series.genre && <Text style={styles.metadataItem}>Genre: {series.genre}</Text>}
                  {series.releaseYear && <Text style={styles.metadataItem}>Released: {series.releaseYear}</Text>}
                  <Text style={styles.metadataItem}>
                    Status: {series.isFeatured ? 'Featured' : 'Standard'}
                  </Text>
                </View>
              </View>
            </View>
            
            <Button
              icon={<Icon name="edit-2" type="feather" color="#fff" size={16} />}
              title="Edit Series Details"
              onPress={() => navigation.navigate('SeriesEdit', { id: series.id })}
              buttonStyle={styles.actionButton}
              containerStyle={{marginTop: 10}}
            />
          </Card>

          {/* Episodes Section */}
          <Card containerStyle={styles.episodesCard}>
            <Card.Title h4>Episodes</Card.Title>
            <Card.Divider />

            {/* Episode List */}
            {episodes.length > 0 ? (
              episodes.map((episode, index) => (
                <View key={episode.id} style={styles.episodeItem}>
                  <View style={styles.episodeHeader}>
                    <View style={styles.episodeNumberContainer}>
                      <Text style={styles.episodeNumber}>{episode.episodeNumber || index + 1}</Text>
                    </View>
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeTitle}>{episode.title}</Text>
                      <Text style={styles.episodeDuration}>{episode.duration || 'No duration set'}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.episodeEditButton}
                      onPress={() => navigation.navigate('EpisodeEdit', { id: episode.id })}
                    >
                      <Icon name="edit-2" type="feather" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  {episode.thumbnailUrl && (
                    <Image source={{ uri: episode.thumbnailUrl }} style={styles.episodeThumbnail} />
                  )}
                  
                  <Text style={styles.episodeDescription}>{episode.description || 'No description'}</Text>
                  <Text style={styles.videoUrl}>
                    {episode.videoUrl ? 'Video URL: Set ✓' : 'Video URL: Not set ✗'}
                  </Text>
                  
                  <Divider style={{marginTop: 10}} />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No episodes yet. Add your first episode below.</Text>
            )}

            {/* Add New Episode Form */}
            <View style={styles.addEpisodeForm}>
              <Text h4 style={styles.formTitle}>Add New Episode</Text>
              
              <Input
                label="Episode Title *"
                placeholder="Enter episode title"
                value={newEpisode.title}
                onChangeText={(text) => setNewEpisode({...newEpisode, title: text})}
                containerStyle={styles.inputContainer}
              />
              
              <Input
                label="Description"
                placeholder="Enter episode description"
                value={newEpisode.description}
                onChangeText={(text) => setNewEpisode({...newEpisode, description: text})}
                multiline
                numberOfLines={3}
                containerStyle={styles.inputContainer}
                inputStyle={styles.textArea}
              />
              
              <View style={styles.rowInputs}>
                <Input
                  label="Episode Number"
                  placeholder="1"
                  value={String(newEpisode.episodeNumber)}
                  onChangeText={(text) => setNewEpisode({...newEpisode, episodeNumber: text})}
                  keyboardType="numeric"
                  containerStyle={[styles.inputContainer, {flex: 1, marginRight: 10}]}
                />
                
                <Input
                  label="Duration"
                  placeholder="e.g. 45 min"
                  value={newEpisode.duration}
                  onChangeText={(text) => setNewEpisode({...newEpisode, duration: text})}
                  containerStyle={[styles.inputContainer, {flex: 1}]}
                />
              </View>
              
              <View style={styles.imageSelectionContainer}>
                <Text style={styles.imageLabel}>Episode Video</Text>
                <Button
                  icon={<Icon name="video" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
                  title={newEpisode.videoUri ? "Change Video" : "Select Video"}
                  onPress={() => pickVideo((uri) => setNewEpisode({...newEpisode, videoUri: uri}))}
                  buttonStyle={styles.imageButton}
                  containerStyle={styles.imageButtonContainer}
                />
                {newEpisode.videoUri && (
                  <Text>Video selected - will upload on save</Text>
                )}
              </View>
              
              <View style={styles.imageSelectionContainer}>
                <Text style={styles.imageLabel}>Episode Thumbnail</Text>
                <Button
                  icon={<Icon name="image" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
                  title={newEpisode.thumbnailUri ? "Change Thumbnail" : "Select Thumbnail"}
                  onPress={() => pickImage((uri) => setNewEpisode({...newEpisode, thumbnailUri: uri}))}
                  buttonStyle={styles.imageButton}
                  containerStyle={styles.imageButtonContainer}
                />
                {newEpisode.thumbnailUri && (
                  <Image source={{ uri: newEpisode.thumbnailUri }} style={styles.selectedImage} />
                )}
              </View>
              
              <Button
                title={loading ? "Adding..." : "Add Episode"}
                onPress={saveEpisode}
                disabled={loading || !newEpisode.title.trim()}
                buttonStyle={styles.saveButton}
                containerStyle={styles.saveButtonContainer}
                icon={<Icon name="plus" type="feather" color="#fff" size={16} style={{marginRight: 10}} />}
              />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  };

  // keep focus on inputs during typing
  useEffect(() => {
    if (activeView === 'addSeries' && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [activeView]);
  useEffect(() => {
    if (activeView === 'addSeries' && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [seriesTitle]);
  useEffect(() => {
    if (activeView === 'addSeries' && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [seriesDescription]);
  useEffect(() => {
    if (activeView === 'addSeries' && genreInputRef.current) {
      genreInputRef.current.focus();
    }
  }, [seriesGenre]);
  useEffect(() => {
    if (activeView === 'addSeries' && yearInputRef.current) {
      yearInputRef.current.focus();
    }
  }, [releaseYear]);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <HeaderBar
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationCount={0}
        onLogout={() => {}}
        onSettings={() => navigation.navigate('Settings')}
      />
      
      <View style={styles.bodyContainer}>
        {!isMobile && (
          <Sidebar
            navigation={navigation}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        )}
        
        {/* Main Content Area */}
        <View style={[styles.mainContent, { backgroundColor: appTheme.colors.background }]}>
          {activeView === 'seriesList' && <SeriesListView />}
          {activeView === 'addSeries' && <AddSeriesView />}
          {activeView === 'viewSeries' && <ViewSeriesView />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
  },
  bodyContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 'calc(100vh - 64px)',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  headerWithActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  secondaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  seriesCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  seriesCardContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  seriesThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 5,
  },
  seriesInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  seriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  seriesDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  seriesGenre: {
    fontSize: 13,
    color: '#777',
  },
  seriesReleaseYear: {
    fontSize: 13,
    color: '#777',
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    marginVertical: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 15,
    height: 38,
  },
  viewButton: {
    backgroundColor: theme.colors.primary,
  },
  editButton: {
    backgroundColor: theme.colors.accent,
  },
  formContainer: {
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginTop: 5,
    marginBottom: 15,
  },
  imageSelectionContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#86939e',
    marginLeft: 10,
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
  },
  imageButtonContainer: {
    marginBottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedBanner: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    height: 50,
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  detailCard: {
    borderRadius: 10,
    marginBottom: 20,
  },
  seriesDetailRow: {
    flexDirection: 'row',
  },
  detailThumbnail: {
    width: 150,
    height: 100,
    borderRadius: 5,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 15,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  detailMetadata: {
    marginTop: 5,
  },
  metadataItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  episodesCard: {
    borderRadius: 10,
    marginBottom: 20,
  },
  episodeItem: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  episodeNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  episodeNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeDuration: {
    fontSize: 12,
    color: '#888',
  },
  episodeEditButton: {
    padding: 5,
  },
  episodeThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 5,
    marginBottom: 10,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  videoUrl: {
    fontSize: 13,
    color: '#777',
  },
  addEpisodeForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  formTitle: {
    marginBottom: 15,
    fontSize: 18,
  },
  rowInputs: {
    flexDirection: 'row',
  },
});

// Wrap with ThemeProvider for dark/light mode support
const ContentManagementScreenWithTheme = (props) => (
  <ThemeProvider>
    <ContentManagementScreen {...props} />
  </ThemeProvider>
);

export default ContentManagementScreenWithTheme; 
