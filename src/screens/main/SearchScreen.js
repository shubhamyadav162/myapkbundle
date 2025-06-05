import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native-elements';

// Import theme
import theme from '../../theme';

// Dummy data for search results
const dummyResults = [
  {
    id: '1',
    title: 'Stranger Things',
    type: 'TV Series',
    year: '2016',
    imageUrl: 'https://source.unsplash.com/random/400x600?movie',
    rating: 8.7,
    episodes: 34,
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and a strange little girl.'
  },
  {
    id: '2',
    title: 'The Witcher',
    type: 'TV Series',
    year: '2019',
    imageUrl: 'https://source.unsplash.com/random/400x600?tv',
    rating: 8.2,
    episodes: 16,
    description: 'A solitary monster hunter struggles to find his place in a world where people often prove more wicked than beasts.'
  },
  {
    id: '3',
    title: 'Inception',
    type: 'Movie',
    year: '2010',
    imageUrl: 'https://source.unsplash.com/random/400x600?movie',
    rating: 8.8,
    episodes: 1,
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.'
  },
  {
    id: '4',
    title: 'Breaking Bad',
    type: 'TV Series',
    year: '2008',
    imageUrl: 'https://source.unsplash.com/random/400x600?drama',
    rating: 9.5,
    episodes: 62,
    description: "A chemistry teacher diagnosed with cancer teams up with a former student to manufacture and sell crystal meth to secure his family's future."
  },
  {
    id: '5',
    title: 'The Dark Knight',
    type: 'Movie',
    year: '2008',
    imageUrl: 'https://source.unsplash.com/random/400x600?hero',
    rating: 9.0,
    episodes: 1,
    description: 'Batman faces the Joker, a criminal mastermind who plunges Gotham City into anarchy and forces Batman closer to crossing the fine line between hero and vigilante.'
  },
  {
    id: '6',
    title: 'Interstellar',
    type: 'Movie',
    year: '2014',
    imageUrl: 'https://source.unsplash.com/random/400x600?space',
    rating: 8.6,
    episodes: 1,
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  
  // Dummy recent searches
  const recentSearches = ['Stranger Things', 'Action Movies', 'Comedy'];

  const handleSearch = () => {
    if (query.trim() === '') return;
    
    setSearching(true);
    setShowRecentSearches(false);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      const filteredResults = dummyResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredResults);
      setSearching(false);
    }, 1000);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowRecentSearches(true);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ContentDetails', { contentId: item.id })}
      style={{ marginBottom: theme.spacing.medium }}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.resultCard}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.resultImage}
          PlaceholderContent={<ActivityIndicator color={theme.colors.primary} />}
        />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultMeta}>{item.type} • {item.year}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.episodesText}>• {item.episodes} Episodes</Text>
          </View>
          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRecentSearch = (item, index) => (
    <TouchableOpacity
      key={index}
      activeOpacity={0.8}
      onPress={() => {
        setQuery(item);
        setShowRecentSearches(false);
        setSearching(true);
        setTimeout(() => {
          const filteredResults = dummyResults.filter(result =>
            result.title.toLowerCase().includes(item.toLowerCase())
          );
          setResults(filteredResults);
          setSearching(false);
        }, 1000);
      }}
      style={{ marginBottom: theme.spacing.small }}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.recentCard}
      >
        <View style={styles.recentCardContent}>
          <Ionicons name="time-outline" size={20} color={theme.colors.text} />
          <Text style={styles.recentCardText}>{item}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, '#1A1A1A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for movies, shows, genres..."
            placeholderTextColor="#999999"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : showRecentSearches ? (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {recentSearches.map(renderRecentSearch)}
          
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          {dummyResults.slice(0, 3).map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => {
                setQuery(item.title);
                setShowRecentSearches(false);
                setResults([item]);
              }}
              style={{ marginBottom: theme.spacing.small }}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recentCard}
              >
                <View style={styles.recentCardContent}>
                  <Ionicons name="trending-up-outline" size={20} color={theme.colors.text} />
                  <Text style={styles.recentCardText}>{item.title}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={50} color="#999999" />
          <Text style={styles.noResultsText}>No results found for "{query}"</Text>
          <Text style={styles.noResultsSubtext}>Try different keywords or check spelling</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 16,
    fontSize: 16,
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.small,
    ...theme.shadows.medium,
  },
  resultImage: {
    width: 100,
    height: 150,
  },
  resultInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultMeta: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.small / 2,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: theme.typography.fontSize.small,
    marginLeft: 4,
  },
  episodesText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
  },
  descriptionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  recentCard: {
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginHorizontal: theme.spacing.medium,
    ...theme.shadows.small,
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentCardText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.regular,
    marginLeft: theme.spacing.small,
  },
});

export default SearchScreen; 
