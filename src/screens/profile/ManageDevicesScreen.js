import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const ManageDevicesScreen = ({ navigation }) => {
  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Devices</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>Here you can manage your connected devices.</Text>
      </View>
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
    paddingHorizontal: theme.spacing.medium,
    height: 60,
  },
  backButton: {
    padding: theme.spacing.small,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    textAlign: 'center',
  },
});

export default ManageDevicesScreen; 
