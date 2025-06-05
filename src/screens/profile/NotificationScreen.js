import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const NotificationScreen = ({ navigation }) => {
  const handleBack = () => navigation.goBack();

  // Format ISO date to readable string
  const formatDate = isoString => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Clear all notifications
  const clearAll = () => {
    // No-op since notifications are static
  };

  // Use an empty array for notifications to avoid undefined errors
  const notifications = [];

  // Render notification item
  const renderNotification = ({ item }) => (
    <TouchableOpacity style={styles.notificationCard} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <Ionicons name="notifications-outline" size={24} color={theme.colors.accent} />
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notificationDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.colors.inactive} />
          <Text style={styles.emptyText}>You're all caught up!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    height: 60,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.small,
  },
  headerTitle: {
    color: '#fff',
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
  },
  clearButton: {
    padding: theme.spacing.small,
  },
  listContainer: {
    paddingVertical: theme.spacing.medium,
  },
  notificationCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    ...theme.shadows.small,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  notificationTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.tiny,
  },
  notificationMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.regular,
    marginBottom: theme.spacing.small,
  },
  notificationDate: {
    color: theme.colors.inactive,
    fontSize: theme.typography.fontSize.small,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.medium,
    marginTop: theme.spacing.small,
  },
});

export default NotificationScreen; 
