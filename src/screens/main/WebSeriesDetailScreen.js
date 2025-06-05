import React from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity } from 'react-native';
import theme from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WebSeriesDetailScreen = ({ route, navigation }) => {
  const series = route.params.series ?? route.params;
  // Use the provided universal video URL for playback
  const videoSource = 'https://ottbigshow.b-cdn.net/From%20the%20World%20of%20John%20Wick%EF%BC%9A%20Ballerina%20(2025)%20Final%20Trailer%20%E2%80%93%20Ana%20de%20Armas%2C%20Keanu%20Reeves%20(1).mp4';
  return (
    <ImageBackground source={series.source} style={styles.backgroundImage} blurRadius={2}>
      <View style={styles.overlay} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.detailsCard}>
        <Text style={styles.title}>{series.title}</Text>
        <Text style={styles.meta}>{series.year} • {series.episodes} Episodes • {series.rating}/10</Text>
        <Text style={styles.description}>{series.description}</Text>
        <View style={styles.episodeDotsContainer}>
          {Array.from({ length: series.episodes }).map((_, i) => (
            <View key={i} style={styles.episodeDot} />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('VideoPlayer', { source: videoSource, title: series.title })}>
            <Text style={styles.playButtonText}>Play ▶</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.episodesButton} onPress={() => navigation.navigate('Episodes', { id: series.id })}>
            <Text style={styles.episodesButtonText}>Episodes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  detailsCard: {
    width: '80%',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    zIndex: 2,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.small,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.regular,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    marginBottom: theme.spacing.small,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.medium,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.small,
  },
  playButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.medium,
  },
  episodesButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
  },
  episodesButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.medium,
  },
  episodeDotsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  episodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.small / 2,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.large,
    left: theme.spacing.small,
    zIndex: 3,
  },
});

export default WebSeriesDetailScreen; 
