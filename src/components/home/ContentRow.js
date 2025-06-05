import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import components
import ContentCard from '../common/ContentCard';

// Import theme
import theme from '../../theme';

// Calculate dimensions based on screen width
const { width } = Dimensions.get('window');

/**
 * ContentRow component for displaying a horizontal row of content
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Row title
 * @param {Array} props.data - Array of content items
 * @param {string} props.size - Card size (small, medium, large)
 * @param {boolean} props.showSeeAll - Whether to show the "See All" button
 * @param {Function} props.onSeeAllPress - Function to call when "See All" is pressed
 */
const ContentRow = ({
  title,
  data,
  size = 'medium',
  showSeeAll = false,
  onSeeAllPress,
}) => {
  // If no data, don't render anything
  if (!data || data.length === 0) {
    return null;
  }

  // Handle see all press
  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        {showSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllPress}>
            <Text style={styles.seeAllText}>See All</Text>
            <Icon name="chevron-right" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ContentCard item={item} size={size} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToAlignment="start"
        snapToInterval={
          size === 'small'
            ? width * 0.28 + theme.spacing.small * 2
            : size === 'medium'
            ? width * 0.38 + theme.spacing.small * 2
            : width * 0.45 + theme.spacing.small * 2
        }
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.large,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.medium,
    marginRight: theme.spacing.tiny,
  },
  listContent: {
    paddingHorizontal: theme.spacing.small,
  },
});

export default ContentRow; 
