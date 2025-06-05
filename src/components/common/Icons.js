import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';

// This file centralizes all icon usage to make it easier to debug icon loading issues

export const Icon = (props) => {
  const { name, size = 24, color = '#FFF', style } = props;
  
  try {
    return <Ionicons name={name} size={size} color={color} style={style} />;
  } catch (error) {
    console.warn(`Failed to load icon: ${name}`, error);
    // Fallback to text-based representation
    return (
      <View style={[styles.fallbackIcon, { width: size, height: size }, style]}>
        <Text style={[styles.fallbackText, { color, fontSize: size * 0.5 }]}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }
};

export const IconNames = {
  // Navigation icons
  HOME: 'home',
  HOME_OUTLINE: 'home-outline',
  CALENDAR: 'calendar',
  CALENDAR_OUTLINE: 'calendar-outline',
  TV: 'tv',
  TV_OUTLINE: 'tv-outline',
  PERSON: 'person',
  PERSON_OUTLINE: 'person-outline',
  
  // Other commonly used icons
  PLAY: 'play',
  PAUSE: 'pause',
  SETTINGS: 'settings',
  SEARCH: 'search',
  ARROW_BACK: 'arrow-back',
  MENU: 'menu',
};

const styles = StyleSheet.create({
  fallbackIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  fallbackText: {
    fontWeight: 'bold',
  },
});

export default { Icon, IconNames }; 
