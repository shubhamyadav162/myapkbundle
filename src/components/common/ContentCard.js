import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Import theme
import theme from '../../theme';

// Get screen dimensions
const { width } = Dimensions.get('window');

/**
 * ContentCard component for displaying content thumbnails
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Content item data
 * @param {string} props.item.id - Content ID
 * @param {string} props.item.title - Content title
 * @param {string} props.item.poster - Poster image URL
 * @param {string} props.item.backdrop - Backdrop image URL
 * @param {number} props.size - Card size (small, medium, large)
 * @param {boolean} props.isHero - Whether this is a hero card (larger with more details)
 */
const ContentCard = ({ item, size = 'medium', isHero = false }) => {
  const navigation = useNavigation();

  // Card dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: width * 0.28, height: width * 0.42 };
      case 'medium':
        return { width: width * 0.38, height: width * 0.57 };
      case 'large':
        return { width: width * 0.45, height: width * 0.68 };
      case 'hero':
        return { width: width, height: width * 0.56 };
      default:
        return { width: width * 0.38, height: width * 0.57 };
    }
  };

  // Handle card press
  const handlePress = () => {
    navigation.navigate('ContentDetails', { contentId: item.id });
  };

  // Render hero card
  if (isHero) {
    return (
      <TouchableOpacity
        style={[styles.heroContainer, getDimensions()]}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Image
          style={styles.heroImage}
          source={{ uri: item.backdrop || item.poster }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{item.title}</Text>
            {item.genres && (
              <Text style={styles.heroGenres}>
                {item.genres.slice(0, 3).join(' • ')}
              </Text>
            )}
            {item.releaseYear && (
              <Text style={styles.heroYear}>{item.releaseYear}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Render standard card
  return (
    <TouchableOpacity
      style={[styles.container, getDimensions()]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Image
        style={styles.image}
        source={{ uri: item.poster }}
        resizeMode="cover"
      />
      {size === 'large' && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.small,
    backgroundColor: theme.colors.backgroundLight,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.medium,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: theme.spacing.small,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium,
  },
  heroContainer: {
    position: 'relative',
    marginBottom: theme.spacing.medium,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: theme.spacing.large,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.small,
  },
  heroGenres: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.small,
  },
  heroYear: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
  },
});

export default ContentCard; 
