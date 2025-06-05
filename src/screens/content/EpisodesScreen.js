import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import contentApi from '../../api/contentApi.js';
import theme from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const EpisodesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { contentId } = route.params || {};
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        if (!contentId) {
          setError('Content ID is missing');
          setLoading(false);
          return;
        }
        
        const response = await contentApi.getEpisodes(contentId);
        if (response.success) {
          setEpisodes(response.data);
        } else {
          setError(response.error || 'Failed to load episodes');
        }
      } catch (err) {
        setError('Failed to load episodes');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [contentId]);

  const renderEpisodeItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => 
        navigation.navigate('VideoPlayer', { 
          source: item.video_url || 'https://ottbigshow.b-cdn.net/From%20the%20World%20of%20John%20Wick%EF%BC%9A%20Ballerina%20(2025)%20Final%20Trailer%20%E2%80%93%20Ana%20de%20Armas%2C%20Keanu%20Reeves%20(1).mp4', 
          title: item.title 
        })
      }
    >
      <Image 
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/300x150' }} 
        style={styles.episodeImage}
      />
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeNumber}>EPISODE {String(index + 1).padStart(2, '0')}</Text>
        <Text style={styles.episodeTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (episodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No episodes available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Episodes</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={episodes}
        renderItem={renderEpisodeItem}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={2}
        contentContainerStyle={styles.episodesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  episodesList: {
    padding: 10,
  },
  episodeItem: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  episodeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  episodeInfo: {
    padding: 10,
  },
  episodeNumber: {
    color: '#f5a623',
    fontSize: 12,
    marginBottom: 5,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default EpisodesScreen; 
