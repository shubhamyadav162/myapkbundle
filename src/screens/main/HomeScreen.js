import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const sections = [
  {
    id: '1',
    title: 'Popular on BigShow',
    data: [
      { id: '1', title: 'Mystery Manor', source: require('../../../assets/webimages/img_1061_64a3b9e62e1b8_360x540.jpg') },
      { id: '2', title: 'Space Odyssey', source: require('../../../assets/webimages/img_1061_64a3f3bcb454c_360x540.jpg') },
      { id: '3', title: 'Hidden Truths', source: require('../../../assets/webimages/img_1061_64c246faa4621_360x540.jpg') },
      { id: '4', title: 'Urban Legends', source: require('../../../assets/webimages/img_1061_64f58df62ef08_360x540.jpg') },
      { id: '5', title: 'Royal Heirs', source: require('../../../assets/webimages/img_1061_64f5941204ac8_360x540.jpg') },
    ],
  },
  {
    id: '2',
    title: 'Top Rated',
    data: [
      { id: '6', title: 'Legendary Battles', source: require('../../../assets/webimages/img_1061_64f6cc07b7a46_360x540.jpg') },
      { id: '7', title: 'Cyber Detectives', source: require('../../../assets/webimages/img_1061_64f6cd2450c2a_360x540.jpg') },
      { id: '8', title: 'Ghost Chasers', source: require('../../../assets/webimages/img_1061_64f6cef9bdbe4_360x540.jpg') },
      { id: '9', title: 'Time Travelers', source: require('../../../assets/webimages/img_1061_64f6d02dac262_360x540.jpg') },
      { id: '10', title: 'Island Secrets', source: require('../../../assets/webimages/img_1061_64f6d052762df_360x540.jpg') },
    ],
  },
  {
    id: '3',
    title: 'New Releases',
    data: [
      { id: '11', title: 'Rogue Agents', source: require('../../../assets/webimages/img_1061_64f6d09a0d2a0_360x540.jpg') },
      { id: '12', title: 'Parallel Worlds', source: require('../../../assets/webimages/img_1061_64f6d2f130b4c_360x540.jpg') },
      { id: '13', title: 'Desert Storm', source: require('../../../assets/webimages/img_1061_64f6d4f999c10_360x540.jpg') },
      { id: '14', title: 'Neon Nights', source: require('../../../assets/webimages/img_1061_64f6d51dd6a64_360x540.jpg') },
      { id: '15', title: 'Dark Horizons', source: require('../../../assets/webimages/img_1061_64f6d581a1712_360x540.jpg') },
    ],
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('WebSeries', { screen: 'WebSeriesDetail', params: { source: item.source, id: item.id, title: item.title, year: 2023, episodes: 10, rating: 8.5, description: 'Demo description for ' + item.title } })}
    >
      <Image source={item.source} style={styles.thumbnail} />
      <Text style={styles.thumbnailTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'top' ]}>
      <StatusBar translucent={false} backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Image source={require('../../../assets/mainlogoo.png')} style={styles.logo} />
        <Text style={styles.logoText}>Big Show</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              data={section.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.medium,
  },
  scrollContent: {
    paddingBottom: theme.spacing.large + 60,
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  itemContainer: {
    width: 120,
    marginHorizontal: theme.spacing.small / 2,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.shadows.medium.shadowColor,
    shadowOffset: theme.shadows.medium.shadowOffset,
    shadowOpacity: theme.shadows.medium.shadowOpacity,
    shadowRadius: theme.shadows.medium.shadowRadius,
  },
  thumbnailTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.small / 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    backgroundColor: theme.colors.primary,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    marginLeft: theme.spacing.small,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    transform: [{ perspective: 200 }, { rotateX: '10deg' }, { rotateY: '-10deg' }],
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default HomeScreen; 
