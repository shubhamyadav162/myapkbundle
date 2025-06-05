import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native-elements';

// Import theme
import theme from '../../theme';

// Dummy data for downloads
const dummyDownloads = [
  {
    id: '1',
    title: 'Stranger Things',
    episode: 'S1:E1 - The Vanishing of Will Byers',
    progress: 80, // percentage
    size: '420 MB',
    imageUrl: 'https://source.unsplash.com/random/400x600?movie',
  },
  {
    id: '2',
    title: 'The Witcher',
    episode: 'S1:E3 - Betrayer Moon',
    progress: 100, // percentage
    size: '550 MB',
    imageUrl: 'https://source.unsplash.com/random/400x600?tv',
  },
  {
    id: '3',
    title: 'Inception',
    episode: 'Full Movie',
    progress: 45, // percentage
    size: '1.2 GB',
    imageUrl: 'https://source.unsplash.com/random/400x600?action',
  },
];

const DownloadsScreen = ({ navigation }) => {
  const renderDownloadItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.downloadItem}
      onPress={() => navigation.navigate('ContentDetails', { contentId: item.id, title: item.title })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.downloadImage}
      />
      <View style={styles.downloadInfo}>
        <Text style={styles.downloadTitle}>{item.title}</Text>
        <Text style={styles.downloadEpisode}>{item.episode}</Text>
        <Text style={styles.downloadSize}>{item.size}</Text>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${item.progress}%` }
            ]} 
          />
        </View>
      </View>
      <View style={styles.downloadActions}>
        {item.progress < 100 ? (
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="pause" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('VideoPlayer', { contentId: item.id, title: item.title })}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => 
            Alert.alert(
              'Delete Download',
              `Are you sure you want to delete "${item.title}"?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                },
              ]
            )
          }
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="download-outline" size={60} color="#999999" />
      <Text style={styles.emptyTitle}>No Downloads Yet</Text>
      <Text style={styles.emptyText}>
        Your downloaded movies and shows will appear here
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Content</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, '#1A1A1A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
        {dummyDownloads.length > 0 && (
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.alert('Edit Mode', 'Edit mode would be activated here')}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {dummyDownloads.length > 0 ? (
        <>
          <View style={styles.storageInfoContainer}>
            <Ionicons name="folder-outline" size={20} color="#BBBBBB" />
            <Text style={styles.storageInfoText}>
              2.17 GB of 32 GB used
            </Text>
          </View>
          
          <FlatList
            data={dummyDownloads}
            renderItem={renderDownloadItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.downloadsList}
          />
        </>
      ) : renderEmptyState()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  storageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  storageInfoText: {
    color: '#BBBBBB',
    marginLeft: 8,
    fontSize: 14,
  },
  downloadsList: {
    paddingHorizontal: 16,
  },
  downloadItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  downloadImage: {
    width: 80,
    height: 120,
  },
  downloadInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  downloadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  downloadEpisode: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 8,
  },
  downloadSize: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  downloadActions: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DownloadsScreen; 
