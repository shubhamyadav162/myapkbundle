import React from 'react';
import { StyleSheet, FlatList, View, Image, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';

// Updated upcoming web series with user-provided images
const upcomingSeries = [
  { id: '1', title: 'Sacred Games', source: require('../../../assets/webimages/img_1061_6634e45c07ebe_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming epic crime drama.', genres: ['Crime','Drama'], language: 'Hindi' },
  { id: '2', title: 'Mirzapur', source: require('../../../assets/webimages/img_1061_6635e68f0a878_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming action thriller.', genres: ['Action','Thriller'], language: 'Hindi' },
  { id: '3', title: 'Paatal Lok', source: require('../../../assets/webimages/img_1061_6744270103e3a_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming investigative drama.', genres: ['Drama','Crime'], language: 'Hindi' },
  { id: '4', title: 'Delhi Crime', source: require('../../../assets/webimages/img_1061_673484509f734_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming police procedural.', genres: ['Crime','Drama'], language: 'Hindi' },
  { id: '5', title: 'Scam 1992', source: require('../../../assets/webimages/img_1061_670625996d786_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming financial thriller.', genres: ['Drama','Thriller'], language: 'Hindi' },
  { id: '6', title: 'The Family Man', source: require('../../../assets/webimages/img_1061_6744235f0c24c_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming action spy drama.', genres: ['Action','Thriller'], language: 'Hindi' },
  { id: '7', title: 'Made in Heaven', source: require('../../../assets/webimages/img_1061_680672c788e12_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming wedding drama.', genres: ['Drama','Romance'], language: 'Hindi' },
  { id: '8', title: 'Inside Edge', source: require('../../../assets/webimages/img_1061_680114e0b20e6_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming sports drama.', genres: ['Drama','Sports'], language: 'Hindi' },
  { id: '9', title: 'Breathe', source: require('../../../assets/webimages/img_1061_679386c40573e_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming psychological thriller.', genres: ['Thriller','Drama'], language: 'Hindi' },
  { id: '10', title: 'Bard of Blood', source: require('../../../assets/webimages/img_1061_678f462875558_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming espionage drama.', genres: ['Action','Thriller'], language: 'Hindi' },
  { id: '11', title: 'Criminal Justice', source: require('../../../assets/webimages/img_1061_66e15d04e435b_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming legal drama.', genres: ['Drama','Legal'], language: 'Hindi' },
  { id: '12', title: 'Kota Factory', source: require('../../../assets/webimages/img_1061_6728c49c4ce08_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming coming-of-age drama.', genres: ['Drama'], language: 'Hindi' },
  { id: '13', title: 'Aarya', source: require('../../../assets/webimages/img_1061_67642f72bd946_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming crime drama.', genres: ['Crime','Drama'], language: 'Hindi' },
  { id: '14', title: 'Tandav', source: require('../../../assets/webimages/img_1061_67486a5f1f143_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming political thriller.', genres: ['Thriller','Drama'], language: 'Hindi' },
  { id: '15', title: 'Grahan', source: require('../../../assets/webimages/img_1061_67442eebbc2e2_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Upcoming mystery drama.', genres: ['Drama','Mystery'], language: 'Hindi' },
  { id: '16', title: 'Asur', source: require('../../../assets/webimages/img_1061_67441e4ecc917_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'Dark mythological thriller.', genres: ['Crime','Mythology'], language: 'Hindi' },
  { id: '17', title: 'Hostages', source: require('../../../assets/webimages/img_1061_67441d8755838_360x540.jpg'), year: 2024, episodes: 8, rating: 0, description: 'High-stakes hostage drama.', genres: ['Drama','Thriller'], language: 'Hindi' },
];

// split so we don't repeat images across sections
const featuredSeries = upcomingSeries.slice(0, 5);
const allSeries = upcomingSeries.slice(5);

// Simplified stateless component for each upcoming series item
const UpcomingItem = ({ item, navigation }) => (
  <View style={styles.cardContainer}>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('WebSeriesDetail', {
        source: item.source,
        id: item.id,
        title: item.title,
        year: item.year,
        episodes: item.episodes,
        rating: item.rating,
        description: item.description,
      })}
    >
      <Image source={item.source} style={styles.image} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
      <View style={styles.upcomingTagContainer}>
        {item.genres.map((genre) => (
          <Text key={genre} style={styles.genreTag}>{genre}</Text>
        ))}
        <Text key={item.language} style={styles.genreTag}>{item.language}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

// Featured item for horizontal scroll
const FeaturedItem = ({ item, navigation }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => navigation.navigate('WebSeriesDetail', {
      source: item.source,
      id: item.id,
      title: item.title,
      year: item.year,
      episodes: item.episodes,
      rating: item.rating,
      description: item.description,
    })}
    style={styles.featuredCard}
  >
    <Image source={item.source} style={styles.featuredImage} />
    <View style={styles.featuredOverlay} />
    <View style={styles.tagContainer}>
      {item.genres.map((genre) => (
        <Text key={genre} style={styles.genreTag}>{genre}</Text>
      ))}
      <Text key={item.language} style={styles.genreTag}>{item.language}</Text>
    </View>
  </TouchableOpacity>
);

const UpcomingScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => <UpcomingItem item={item} navigation={navigation} />;

  // Render for featured horizontal list
  const renderFeatured = ({ item }) => <FeaturedItem item={item} navigation={navigation} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent={false} backgroundColor={theme.colors.primary} barStyle="light-content" />
      <Text style={styles.header}>Upcoming Web Series</Text>
      {/* Featured Horizontal Scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <FlatList
          data={featuredSeries}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderFeatured}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
      {/* Full Upcoming List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Upcoming</Text>
        <FlatList
          data={allSeries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.medium,
  },
  header: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: theme.spacing.medium,
  },
  list: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: 0,
    paddingBottom: 0,
  },
  cardContainer: {
    marginBottom: 0,
    width: '100%',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.backgroundLight,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: theme.spacing.small,
  },
  comingSoon: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.inactive,
    marginHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  section: {
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: theme.spacing.small,
  },
  featuredCard: {
    marginRight: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  featuredImage: {
    width: 160,
    height: 240,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tagContainer: {
    position: 'absolute',
    bottom: theme.spacing.small,
    left: theme.spacing.medium,
    flexDirection: 'row',
  },
  genreTag: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.small,
    paddingHorizontal: theme.spacing.tiny,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.tiny,
  },
  upcomingTagContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
});

export default UpcomingScreen; 
