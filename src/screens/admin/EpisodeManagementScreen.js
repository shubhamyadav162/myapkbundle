import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { Text, Button, Icon, Divider, Card } from 'react-native-elements';
import theme from '../../theme';
import { collection, getDocs, deleteDoc, doc, query, orderBy, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, storage } from '../../utils/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderBar from '../../components/common/HeaderBar';
import Sidebar from '../../components/common/Sidebar';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import { ToastContainer } from '../../components/common/Toast';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EpisodeManagementScreen = () => {
  const route = useRoute();
  const { seriesId } = route.params || {};
  
  const [episodes, setEpisodes] = useState([]);
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [sortBy, setSortBy] = useState('episodeAsc');
  const [activeSection, setActiveSection] = useState('content');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEpisodeNumber, setFormEpisodeNumber] = useState('1');
  const [formDuration, setFormDuration] = useState('');
  const [formThumbnail, setFormThumbnail] = useState(null);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const navigation = useNavigation();
  const { theme: appTheme } = useTheme ? useTheme() : { theme };
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  useEffect(() => {
    // Fetch episodes, filtered by seriesId if provided
    if (seriesId) {
      fetchSeriesData();
    }
    fetchEpisodes();
  }, [seriesId]);

  const fetchSeriesData = async () => {
    try {
      const seriesDoc = await doc(db, 'series', seriesId);
      const seriesSnapshot = await getDocs(collection(db, 'series'));
      const seriesDataArray = seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const series = seriesDataArray.find(s => s.id === seriesId);
      
      if (series) {
        setSeriesData(series);
      } else {
        Alert.alert('Error', 'Series not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
      Alert.alert('Error', 'Failed to load series data');
    }
  };

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      // Fetch all episodes or filter by seriesId
      let snap;
      if (seriesId) {
        const q = query(collection(db, 'episodes'), where('seriesId', '==', seriesId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(db, 'episodes'));
      }
      const episodesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEpisodes(episodesData);
      setFilteredEpisodes(episodesData);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      Alert.alert('Error', 'Failed to load episodes data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEpisodes();
  };

  useEffect(() => {
    // Apply filters and sorting whenever the data or filter criteria change
    let results = [...episodes];
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'episodeAsc':
        results.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
        break;
      case 'episodeDesc':
        results.sort((a, b) => (b.episodeNumber || 0) - (a.episodeNumber || 0));
        break;
      case 'titleAsc':
        results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'titleDesc':
        results.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'dateAsc':
        results.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'dateDesc':
        results.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    setFilteredEpisodes(results);
  }, [episodes, searchQuery, sortBy]);

  const handleDeleteEpisode = async (id) => {
    if (window.confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'episodes', id));
        setEpisodes(prevList => prevList.filter(item => item.id !== id));
        Alert.alert('Success', 'Episode deleted successfully');
      } catch (error) {
        console.error('Error deleting episode:', error);
        Alert.alert('Error', 'Failed to delete episode');
      }
    }
  };

  const handleCardPress = (id) => {
    setSelectedCard(selectedCard === id ? null : id);
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
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, path) => {
    if (!uri) return null;
    
    try {
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

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormEpisodeNumber(String(episodes.length + 1));
    setFormDuration('');
    setFormThumbnail(null);
    setFormVideoUrl('');
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the episode');
      return;
    }

    setFormSubmitting(true);
    try {
      // Upload thumbnail if exists
      const thumbnailUrl = await uploadImage(formThumbnail, 'episode_thumbnails');

      // Create episode document
      const episodeData = {
        seriesId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        episodeNumber: Number(formEpisodeNumber),
        duration: formDuration.trim(),
        videoUrl: formVideoUrl.trim(),
        thumbnailUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'episodes'), episodeData);

      Alert.alert('Success', 'Episode created successfully');
      resetForm();
      setShowAddForm(false);
      fetchEpisodes();
    } catch (error) {
      console.error('Error creating episode:', error);
      Alert.alert('Error', 'Failed to create episode. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderEpisodeCard = ({ item }) => {
    const isSelected = selectedCard === item.id;
    
    return (
      <Card containerStyle={styles.episodeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.episodeNumberBadge}>
              <Text style={styles.episodeNumberText}>{item.episodeNumber || '?'}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled Episode'}</Text>
          </View>
          <View style={styles.cardActionButtons}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.editButton]} 
              onPress={() => navigation.navigate('EpisodeEdit', { id: item.id })}
            >
              <Icon name="edit" type="feather" color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.deleteButton]} 
              onPress={() => handleDeleteEpisode(item.id)}
            >
              <Icon name="trash-2" type="feather" color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => handleCardPress(item.id)}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Thumbnail' }} 
            style={styles.thumbnail} 
            resizeMode="cover"
          />
          <View style={styles.cardDetails}>
            <Text style={styles.cardDescription} numberOfLines={isSelected ? undefined : 2}>
              {item.description || 'No description available'}
            </Text>
            
            <View style={styles.metadataContainer}>
              {item.duration && (
                <View style={styles.metadataTag}>
                  <Icon name="clock" type="feather" size={12} color={theme.colors.primary} style={styles.metadataIcon} />
                  <Text style={styles.metadataText}>{item.duration}</Text>
                </View>
              )}
              
              {item.videoUrl ? (
                <View style={styles.metadataTag}>
                  <Icon name="video" type="feather" size={12} color={theme.colors.success} style={styles.metadataIcon} />
                  <Text style={styles.metadataText}>Video Available</Text>
                </View>
              ) : (
                <View style={[styles.metadataTag, { backgroundColor: '#ffeeee' }]}>
                  <Icon name="alert-circle" type="feather" size={12} color={theme.colors.error} style={styles.metadataIcon} />
                  <Text style={[styles.metadataText, { color: theme.colors.error }]}>No Video</Text>
                </View>
              )}
              
              {item.createdAt && (
                <View style={styles.metadataTag}>
                  <Icon name="calendar" type="feather" size={12} color={theme.colors.primary} style={styles.metadataIcon} />
                  <Text style={styles.metadataText}>
                    Added: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <Divider style={styles.cardDivider} />
        
        <View style={styles.cardActions}>
          {item.videoUrl ? (
            <Button
              icon={<Icon name="play" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
              title="Preview"
              onPress={() => Alert.alert('Video Preview', `Playing: ${item.title}\nURL: ${item.videoUrl}`)}
              buttonStyle={styles.previewButton}
            />
          ) : (
            <Button
              icon={<Icon name="video" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
              title="Add Video"
              onPress={() => {
                navigation.navigate('EpisodeEdit', { id: item.id, focus: 'video' });
              }}
              buttonStyle={styles.addVideoButton}
            />
          )}
          
          <Button
            icon={<Icon name="edit-2" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
            title="Edit Details"
            onPress={() => navigation.navigate('EpisodeEdit', { id: item.id })}
            buttonStyle={styles.editDetailsButton}
          />
        </View>
      </Card>
    );
  };

  const AddEpisodeForm = () => (
    <Card containerStyle={styles.formCard}>
      <Card.Title h4>Add New Episode</Card.Title>
      <Card.Divider />
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Episode Title *</Text>
        <TextInput
          style={styles.input}
          value={formTitle}
          onChangeText={setFormTitle}
          placeholder="Enter episode title"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formDescription}
          onChangeText={setFormDescription}
          placeholder="Enter episode description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Episode Number</Text>
          <TextInput
            style={styles.input}
            value={formEpisodeNumber}
            onChangeText={setFormEpisodeNumber}
            placeholder="e.g. 1"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            value={formDuration}
            onChangeText={setFormDuration}
            placeholder="e.g. 45 min"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Video URL</Text>
        <TextInput
          style={styles.input}
          value={formVideoUrl}
          onChangeText={setFormVideoUrl}
          placeholder="Enter video URL (YouTube, Bunny.net, etc.)"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Episode Thumbnail</Text>
        <Button
          title={formThumbnail ? "Change Thumbnail" : "Select Thumbnail"}
          onPress={() => pickImage(setFormThumbnail)}
          buttonStyle={styles.imageButton}
          icon={<Icon name="image" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
        />
        {formThumbnail && (
          <Image source={{ uri: formThumbnail }} style={styles.previewImage} />
        )}
      </View>
      
      <View style={styles.formActions}>
        <Button
          title="Cancel"
          onPress={() => {
            setShowAddForm(false);
            resetForm();
          }}
          buttonStyle={styles.cancelButton}
          containerStyle={styles.actionButtonContainer}
        />
        
        <Button
          title={formSubmitting ? "Submitting..." : "Save Episode"}
          onPress={handleSubmit}
          disabled={formSubmitting || !formTitle.trim()}
          buttonStyle={styles.submitButton}
          containerStyle={styles.actionButtonContainer}
          icon={<Icon name="check" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
        />
      </View>
    </Card>
  );

  if (seriesId && !seriesData && !loading) {
    return (
      <View style={styles.container}>
        <Text>Series not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          buttonStyle={styles.backButton}
          containerStyle={{marginTop: 20}}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: appTheme?.colors?.background || theme.colors.background }]}>
      <HeaderBar />
      
      <View style={styles.bodyContainer}>
        {!isMobile && (
          <Sidebar
            navigation={navigation}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        )}
        
        <ScrollView style={styles.contentContainer}>
          <View style={styles.breadcrumbs}>
            <TouchableOpacity 
              style={styles.breadcrumbItem} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-left" type="feather" size={16} color={appTheme.colors.text} />
              <Text style={styles.breadcrumbText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          {seriesData && (
            <View style={styles.seriesHeader}>
              {seriesData.thumbnailUrl && (
                <Image 
                  source={{ uri: seriesData.thumbnailUrl }} 
                  style={styles.seriesThumbnail}
                />
              )}
              <View style={styles.seriesInfo}>
                <Text h4 style={styles.seriesTitle}>{seriesData.title}</Text>
                <Text style={styles.seriesDescription} numberOfLines={2}>
                  {seriesData.description}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text h4 style={styles.headerTitle}>Episode Management</Text>
              <Text style={styles.subtitle}>Manage episodes for this series</Text>
            </View>
            
            <Button
              icon={<Icon name={showAddForm ? "x" : "plus"} type="feather" color="#fff" size={18} style={{marginRight: 10}} />}
              title={showAddForm ? "Cancel" : "Add New Episode"}
              onPress={() => setShowAddForm(!showAddForm)}
              buttonStyle={[styles.addButton, showAddForm && styles.cancelAddButton]}
              containerStyle={styles.addButtonContainer}
            />
          </View>
          
          {showAddForm && <AddEpisodeForm />}
          
          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <Icon name="search" type="feather" color="#888" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search episodes by title or description..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Icon name="x" type="feather" color="#888" size={18} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <View style={styles.filterOptions}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Sort by:</Text>
                <TouchableOpacity
                  style={styles.sortDropdown}
                  onPress={() => {
                    const options = [
                      { label: 'Episode (Ascending)', value: 'episodeAsc' },
                      { label: 'Episode (Descending)', value: 'episodeDesc' },
                      { label: 'Title (A-Z)', value: 'titleAsc' },
                      { label: 'Title (Z-A)', value: 'titleDesc' },
                      { label: 'Date Added (Newest)', value: 'dateDesc' },
                      { label: 'Date Added (Oldest)', value: 'dateAsc' }
                    ];
                    
                    // Simple dropdown simulation
                    const currentIndex = options.findIndex(o => o.value === sortBy);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSortBy(options[nextIndex].value);
                  }}
                >
                  <Text style={styles.sortText}>{
                    sortBy === 'episodeAsc' ? 'Episode (Ascending)' :
                    sortBy === 'episodeDesc' ? 'Episode (Descending)' :
                    sortBy === 'titleAsc' ? 'Title (A-Z)' :
                    sortBy === 'titleDesc' ? 'Title (Z-A)' :
                    sortBy === 'dateDesc' ? 'Date Added (Newest)' :
                    'Date Added (Oldest)'
                  }</Text>
                  <Icon name="chevron-down" type="feather" size={16} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : filteredEpisodes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="film" type="feather" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No episodes found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Get started by adding your first episode'}
              </Text>
              <Button
                title="Add Your First Episode"
                onPress={() => setShowAddForm(true)}
                buttonStyle={styles.emptyButton}
                containerStyle={styles.emptyButtonContainer}
              />
            </View>
          ) : (
            <View style={styles.episodesList}>
              <Text style={styles.resultsText}>
                {filteredEpisodes.length} {filteredEpisodes.length === 1 ? 'episode' : 'episodes'} found
              </Text>
              {filteredEpisodes.map(item => (
                <View key={item.id}>
                  {renderEpisodeCard({item})}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  breadcrumbs: {
    marginBottom: 16,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    color: theme.colors.primary,
    marginLeft: 4,
    fontSize: 14,
  },
  seriesHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  seriesThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  seriesDescription: {
    color: '#666',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    marginBottom: 4,
    fontSize: 24,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 6,
  },
  cancelAddButton: {
    backgroundColor: theme.colors.error,
  },
  addButtonContainer: {
    marginLeft: 16,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  halfWidth: {
    width: '50%',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginTop: 10,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  actionButtonContainer: {
    marginLeft: 10,
    width: 150,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  submitButton: {
    backgroundColor: theme.colors.success,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#333',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  filterLabel: {
    color: '#555',
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortText: {
    color: '#555',
    marginRight: 8,
    fontSize: 14,
  },
  resultsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  episodesList: {
    marginBottom: 20,
  },
  episodeCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardActionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  thumbnail: {
    width: 160,
    height: 90,
    borderRadius: 4,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  metadataIcon: {
    marginRight: 4,
  },
  metadataText: {
    color: '#555',
    fontSize: 12,
  },
  cardDivider: {
    marginVertical: 0,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  previewButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addVideoButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  editDetailsButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 6,
  },
  emptyButtonContainer: {
    width: 200,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
  },
});

// Wrap with ThemeProvider for dark/light mode support
const EpisodeManagementScreenWithTheme = (props) => (
  <ThemeProvider>
    <EpisodeManagementScreen {...props} />
  </ThemeProvider>
);

export default EpisodeManagementScreenWithTheme; 
