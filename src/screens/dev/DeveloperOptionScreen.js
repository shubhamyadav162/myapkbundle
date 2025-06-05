import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';

const DeveloperOptionScreen = ({ onEnter }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Big Show (Developer Mode)</Text>
      <TouchableOpacity style={styles.button} onPress={onEnter}>
        <Text style={styles.buttonText}>Enter App</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.large,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default DeveloperOptionScreen; 
