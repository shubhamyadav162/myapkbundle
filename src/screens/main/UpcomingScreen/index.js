import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, Image, Text, Animated, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { db } from '../../../utils/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

const UpcomingScreen = () => {
  const navigation = useNavigation();
  const [upcomingSeries, setUpcomingSeries] = useState([]);

  useEffect(() => {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'series'),
      where('isLive', '==', false),
      where('publishDate', '>', now),
      orderBy('publishDate', 'asc')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          year: data.publishDate?.toDate().getFullYear() || new Date().getFullYear(),
          episodes: Array.isArray(data.episodes) ? data.episodes.length : 0,
          rating: data.rating || 0,
          description: data.description || '',
          source: { uri: data.thumbnailUrl || '' },
        };
      });
      setUpcomingSeries(list);
    });
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate('WebSeries', {
          screen: 'WebSeriesDetail',
          params: { series: item },
        });
      });
    };

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>  
        <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut}>
          <Image source={item.source} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>Upcoming Web Series</Text>
      <FlatList
        data={upcomingSeries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  },
  list: {
    paddingHorizontal: 0,
  },
  cardContainer: {
    marginBottom: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  image: {
    width: '100%',
    height: 300,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default UpcomingScreen; 
