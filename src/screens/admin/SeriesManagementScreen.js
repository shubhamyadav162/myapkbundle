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
import { collection, getDocs, deleteDoc, doc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../utils/firebase';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../components/common/HeaderBar';
import Sidebar from '../../components/common/Sidebar';
import { ThemeProvider, useTheme } from '../../components/common/ThemeProvider';
import { ToastContainer } from '../../components/common/Toast';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SeriesManagementScreen = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [sortBy, setSortBy] = useState('dateDesc');
  const [activeSection, setActiveSection] = useState('content');
  const [selectedCard, setSelectedCard] = useState(null);
  const [genres, setGenres] = useState(['All']);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState('');
  const [formThumbnail, setFormThumbnail] = useState(null);
  const [formBanner, setFormBanner] = useState(null);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const navigation = useNavigation();
  const { theme: appTheme } = useTheme ? useTheme() : { theme };
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'series'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const seriesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Extract all unique genres
      const allGenres = new Set(['All']);
      seriesData.forEach(series => {
        if (series.genre) {
          allGenres.add(series.genre);
        }
      });
      
      setGenres(Array.from(allGenres));
      setSeriesList(seriesData);
      setFilteredSeries(seriesData);
      
    } catch (error) {
      console.error('Error fetching series:', error);
      Alert.alert('Error', 'Failed to load series data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSeries();
  };

  useEffect(() => {
    // Apply filters and sorting whenever the data or filter criteria change
    let results = [...seriesList];
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply genre filter
    if (filterGenre !== 'All') {
      results = results.filter(item => item.genre === filterGenre);
    }
    
    // Apply sorting
    switch (sortBy) {
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
    
    setFilteredSeries(results);
  }, [seriesList, searchQuery, filterGenre, sortBy]);

  const handleDeleteSeries = async (id) => {
    if (window.confirm('Are you sure you want to delete this series? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'series', id));
        setSeriesList(prevList => prevList.filter(item => item.id !== id));
        Alert.alert('Success', 'Series deleted successfully');
      } catch (error) {
        console.error('Error deleting series:', error);
        Alert.alert('Error', 'Failed to delete series');
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
    setFormGenre('');
    setFormReleaseYear('');
    setFormThumbnail(null);
    setFormBanner(null);
    setFormFeatured(false);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the series');
      return;
    }

    setFormSubmitting(true);
    try {
      // Upload thumbnail and banner if exists
      const thumbnailUrl = await uploadImage(formThumbnail, 'series_thumbnails');
      const bannerUrl = await uploadImage(formBanner, 'series_banners');

      // Create series document
      const seriesData = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        genre: formGenre.trim(),
        thumbnailUrl,
        bannerUrl,
        isFeatured: formFeatured,
        releaseYear: formReleaseYear.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await fetch('https://firestore.googleapis.com/v1/projects/your-project-id/databases/(default)/documents/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            title: { stringValue: seriesData.title },
            description: { stringValue: seriesData.description },
            genre: { stringValue: seriesData.genre },
            thumbnailUrl: thumbnailUrl ? { stringValue: thumbnailUrl } : null,
            bannerUrl: bannerUrl ? { stringValue: bannerUrl } : null,
            isFeatured: { booleanValue: seriesData.isFeatured },
            releaseYear: { stringValue: seriesData.releaseYear },
            createdAt: { timestampValue: new Date().toISOString() },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        })
      });

      Alert.alert('Success', 'Series created successfully');
      resetForm();
      setShowAddForm(false);
      fetchSeries();
    } catch (error) {
      console.error('Error creating series:', error);
      Alert.alert('Error', 'Failed to create series. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderSeriesCard = ({ item }) => {
    const isSelected = selectedCard === item.id;
    
    return (
      <Card containerStyle={styles.seriesCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled Series'}</Text>
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>
          <View style={styles.cardActionButtons}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.editButton]} 
              onPress={() => navigation.navigate('SeriesEdit', { id: item.id })}
            >
              <Icon name="edit" type="feather" color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.deleteButton]} 
              onPress={() => handleDeleteSeries(item.id)}
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
              {item.genre && (
                <View style={styles.metadataTag}>
                  <Icon name="film" type="feather" size={12} color={theme.colors.primary} style={styles.metadataIcon} />
                  <Text style={styles.metadataText}>{item.genre}</Text>
                </View>
              )}
              
              {item.releaseYear && (
                <View style={styles.metadataTag}>
                  <Icon name="calendar" type="feather" size={12} color={theme.colors.primary} style={styles.metadataIcon} />
                  <Text style={styles.metadataText}>{item.releaseYear}</Text>
                </View>
              )}
              
              {item.createdAt && (
                <View style={styles.metadataTag}>
                  <Icon name="clock" type="feather" size={12} color={theme.colors.primary} style={styles.metadataIcon} />
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
          <Button
            icon={<Icon name="play" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
            title="View Episodes"
            onPress={() => navigation.navigate('Episodes', { seriesId: item.id })}
            buttonStyle={styles.episodesButton}
          />
          
          <Button
            icon={<Icon name="plus" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
            title="Add Episode"
            onPress={() => navigation.navigate('EpisodeAdd', { seriesId: item.id })}
            buttonStyle={styles.addEpisodeButton}
          />
        </View>
      </Card>
    );
  };

  const AddSeriesForm = () => (
    <Card containerStyle={styles.formCard}>
      <Card.Title h4>Add New Series</Card.Title>
      <Card.Divider />
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formTitle}
          onChangeText={setFormTitle}
          placeholder="Enter series title"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formDescription}
          onChangeText={setFormDescription}
          placeholder="Enter series description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Genre</Text>
          <TextInput
            style={styles.input}
            value={formGenre}
            onChangeText={setFormGenre}
            placeholder="e.g. Action, Comedy"
          />
        </View>
        
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Release Year</Text>
          <TextInput
            style={styles.input}
            value={formReleaseYear}
            onChangeText={setFormReleaseYear}
            placeholder="e.g. 2023"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setFormFeatured(!formFeatured)}
          >
            <View style={[styles.checkboxInner, formFeatured && styles.checkboxChecked]}>
              {formFeatured && <Icon name="check" type="feather" size={12} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Feature this series on home page</Text>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Series Thumbnail</Text>
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
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Series Banner (16:9 ratio recommended)</Text>
        <Button
          title={formBanner ? "Change Banner" : "Select Banner"}
          onPress={() => pickImage(setFormBanner)}
          buttonStyle={styles.imageButton}
          icon={<Icon name="image" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
        />
        {formBanner && (
          <Image source={{ uri: formBanner }} style={styles.previewBanner} />
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
          title={formSubmitting ? "Submitting..." : "Save Series"}
          onPress={handleSubmit}
          disabled={formSubmitting || !formTitle.trim()}
          buttonStyle={styles.submitButton}
          containerStyle={styles.actionButtonContainer}
          icon={<Icon name="check" type="feather" color="#fff" size={16} style={{marginRight: 8}} />}
        />
      </View>
    </Card>
  );

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
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text h4 style={styles.headerTitle}>Series Management</Text>
              <Text style={styles.subtitle}>Create and manage your web series content</Text>
            </View>
            
            <Button
              icon={<Icon name={showAddForm ? "x" : "plus"} type="feather" color="#fff" size={18} style={{marginRight: 10}} />}
              title={showAddForm ? "Cancel" : "Add New Series"}
              onPress={() => setShowAddForm(!showAddForm)}
              buttonStyle={[styles.addButton, showAddForm && styles.cancelAddButton]}
              containerStyle={styles.addButtonContainer}
            />
          </View>
          
          {showAddForm && <AddSeriesForm />}
          
          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <Icon name="search" type="feather" color="#888" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search series by title or description..."
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
                <Text style={styles.filterLabel}>Genre:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                  {genres.map(genre => (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.filterChip,
                        filterGenre === genre && styles.activeFilterChip
                      ]}
                      onPress={() => setFilterGenre(genre)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filterGenre === genre && styles.activeFilterChipText
                      ]}>
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Sort:</Text>
                <TouchableOpacity
                  style={styles.sortDropdown}
                  onPress={() => {
                    const options = [
                      { label: 'Newest First', value: 'dateDesc' },
                      { label: 'Oldest First', value: 'dateAsc' },
                      { label: 'Title (A-Z)', value: 'titleAsc' },
                      { label: 'Title (Z-A)', value: 'titleDesc' }
                    ];
                    
                    // Simple dropdown simulation
                    const currentIndex = options.findIndex(o => o.value === sortBy);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setSortBy(options[nextIndex].value);
                  }}
                >
                  <Text style={styles.sortText}>{
                    sortBy === 'dateDesc' ? 'Newest First' :
                    sortBy === 'dateAsc' ? 'Oldest First' :
                    sortBy === 'titleAsc' ? 'Title (A-Z)' :
                    'Title (Z-A)'
                  }</Text>
                  <Icon name="chevron-down" type="feather" size={16} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : filteredSeries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="film" type="feather" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No series found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery || filterGenre !== 'All' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first series'}
              </Text>
              <Button
                title="Add Your First Series"
                onPress={() => setShowAddForm(true)}
                buttonStyle={styles.emptyButton}
                containerStyle={styles.emptyButtonContainer}
              />
            </View>
          ) : (
            <View style={styles.seriesList}>
              <Text style={styles.resultsText}>
                {filteredSeries.length} {filteredSeries.length === 1 ? 'series' : 'series'} found
              </Text>
              {filteredSeries.map(item => (
                <View key={item.id}>
                  {renderSeriesCard({item})}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
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
  previewBanner: {
    width: '100%',
    height: 150,
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
    flex: 1,
    minWidth: 200,
  },
  filterLabel: {
    color: '#555',
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: '#555',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: '#fff',
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
  seriesList: {
    marginBottom: 20,
  },
  seriesCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    width: 120,
    height: 80,
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
  episodesButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addEpisodeButton: {
    backgroundColor: theme.colors.success,
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
});

// Wrap with ThemeProvider for dark/light mode support
const SeriesManagementScreenWithTheme = (props) => (
  <ThemeProvider>
    <SeriesManagementScreen {...props} />
  </ThemeProvider>
);

export default SeriesManagementScreenWithTheme; 
