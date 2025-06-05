import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import contentApi from '../../api/contentApi.js';
import theme from '../../theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';
import SubscriptionModal from '../../components/common/SubscriptionModal';
import { checkSubscriptionStatus, isSubscriptionRequired } from '../../utils/subscription';

const ContentDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { contentId } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'episodes'
  const [hasSubscription, setHasSubscription] = useState(false);
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await contentApi.getContentDetails(contentId);
      if (response.success) {
        setContent(response.data);
        setRequiresSubscription(response.data.isPremium || false);
      } else {
        setError(response.error);
      }
      setLoading(false);
    };
    fetchDetails();
    checkUserSubscription();
  }, [contentId]);

  const checkUserSubscription = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_subscribed, subscription_end_date')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        const isActive = data?.is_subscribed && 
          data?.subscription_end_date && 
          new Date(data.subscription_end_date) > new Date();
        
        setHasSubscription(isActive);
      } catch (error) {
        console.error('Error checking subscription:', error.message);
        setHasSubscription(false);
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${content?.title} on BigShow OTT!`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleWatchPress = () => {
    if (requiresSubscription && !hasSubscription) {
      navigation.navigate('Subscription');
    } else {
      navigation.navigate('VideoPlayer', { 
        source: content?.videoUrl || 'https://ottbigshow.b-cdn.net/From%20the%20World%20of%20John%20Wick%EF%BC%9A%20Ballerina%20(2025)%20Final%20Trailer%20%E2%80%93%20Ana%20de%20Armas%2C%20Keanu%20Reeves%20(1).mp4',
        title: content?.title || ''
      });
    }
  };

  const handleSubscriptionSuccess = () => {
    setHasSubscription(true);
    setShowSubscriptionModal(false);
    navigation.navigate('VideoPlayer', { 
      contentId: contentId,
      title: content?.title || ''
    });
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

  return (
    <View style={styles.container}>
      <ScrollView>
        {content?.imageUrl && <Image source={{ uri: content.imageUrl }} style={styles.image} resizeMode="cover" />}
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{content?.title || 'No Title'}</Text>
          
          <View style={styles.genreContainer}>
            {content?.genres?.map((genre, index) => (
              <Text key={index} style={styles.genre}>
                {genre}{index < content.genres.length - 1 ? ' | ' : ''}
              </Text>
            )) || <Text style={styles.genre}>Drama | Romance</Text>}
            <Text style={styles.language}>{content?.language || 'Hindi'}</Text>
          </View>
          
          <View style={styles.contentDetailsContainer}>
            <Text style={styles.contentDetails}>
              Content Details: {content?.contentRating || 'Mature Content, Foul Language'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.watchButton}
            onPress={handleWatchPress}
          >
            <Text style={styles.watchButtonText}>
              {requiresSubscription && !hasSubscription ? 'Subscribe to Watch' : 'Watch Now'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.trailerButton}
            onPress={() =>
              navigation.navigate('VideoPlayer', { 
                source: content?.trailerUrl || 'https://example.com/trailer.mp4', 
                title: `${content?.title} - Trailer` 
              })
            }
          >
            <Text style={styles.trailerButtonText}>Trailer</Text>
          </TouchableOpacity>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'episodes' && styles.activeTab]}
              onPress={() => {
                setActiveTab('episodes');
                navigation.navigate('Episodes', { contentId });
              }}
            >
              <Text style={[styles.tabText, activeTab === 'episodes' && styles.activeTabText]}>Episodes</Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'info' && (
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisTitle}>Synopsis:</Text>
              <Text style={styles.synopsis}>{content?.description || 'No description available.'}</Text>
              
              {content?.director && (
                <Text style={styles.directorText}>Directed by: {content.director}</Text>
              )}
              
              {content?.cast && (
                <Text style={styles.castText}>Cast: {content.cast}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  genre: {
    fontSize: 14,
    color: '#ccc',
  },
  language: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 4,
  },
  contentDetailsContainer: {
    marginBottom: 16,
  },
  contentDetails: {
    fontSize: 14,
    color: '#aaa',
  },
  watchButton: {
    backgroundColor: '#f5a623',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  watchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trailerButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  trailerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  synopsisContainer: {
    marginTop: 8,
  },
  synopsisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  directorText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  castText: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default ContentDetailsScreen; 
