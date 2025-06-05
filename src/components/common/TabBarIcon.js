import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import theme from '../../theme';

const TabBarIcon = ({ focused, iconName, label }) => {
  const animation = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.2)).current;
  const textOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (focused && animation.current) {
      animation.current.play();
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scale, shadowOpacity, textOpacity]);

  // Determine which animation to use based on the iconName
  const getLottieSource = () => {
    if (iconName === 'home' || iconName === 'home-outline') {
      return require('../../../assets/animations/home.json');
    } else if (iconName === 'calendar' || iconName === 'calendar-outline') {
      return require('../../../assets/animations/calendar.json');
    } else if (iconName === 'tv' || iconName === 'tv-outline') {
      return require('../../../assets/animations/tv.json');
    } else if (iconName === 'person' || iconName === 'person-outline') {
      return require('../../../assets/animations/person.json');
    }
    // Default to a generic animation if no match
    return require('../../../assets/animations/home.json');
  };

  // Fallback to use regular Ionicons when Lottie files are not available yet
  const renderIcon = () => {
    try {
      return (
        <LottieView
          ref={animation}
          source={getLottieSource()}
          style={styles.lottieIcon}
          autoPlay={false}
          loop={false}
          speed={1.5}
        />
      );
    } catch (error) {
      console.log('Fallback to regular icon:', error);
      return (
        <Ionicons
          name={iconName}
          size={24}
          color={focused ? theme.colors.primary : '#888'}
        />
      );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            shadowOpacity: shadowOpacity,
            backgroundColor: focused ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
          },
        ]}
      >
        {renderIcon()}
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          {
            opacity: textOpacity,
            color: focused ? '#FFFFFF' : theme.colors.inactive,
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 50,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    elevation: 6,
  },
  lottieIcon: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default TabBarIcon; 
