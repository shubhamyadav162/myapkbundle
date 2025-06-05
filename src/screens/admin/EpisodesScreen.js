import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Card, Button, Icon } from 'react-native-elements';
import theme from '../../theme';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const EpisodesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { seriesId } = route.params;
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      const q = query(collection(db, 'episodes'), where('seriesId', '==', seriesId));
      const snap = await getDocs(q);
      setEpisodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEpisodes();
  }, [seriesId]);

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      {item.thumbnailUrl && <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title || 'Untitled Episode'}</Text>
        <Icon name="edit" type="feather" color={theme.colors.accent} onPress={() => navigation.navigate('EpisodeEdit', { id: item.id })} />
      </View>
      <Text style={styles.cardSubtitle}>{item.description || 'No description'}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text h4 style={styles.header}>Episodes Management</Text>
        <Icon
          name="plus-circle"
          type="feather"
          color={theme.colors.success}
          size={28}
          onPress={() => navigation.navigate('EpisodeAdd', { seriesId })}
        />
      </View>
      <FlatList
        data={episodes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  header: {
    color: theme.colors.text,
  },
  list: {
    paddingBottom: theme.spacing.large,
  },
  card: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.backgroundLight,
    ...theme.shadows.medium,
    marginBottom: theme.spacing.large,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
});

export default EpisodesScreen; 
