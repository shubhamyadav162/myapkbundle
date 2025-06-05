import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseTheme from '../../theme';

const ThemeContext = createContext();

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...baseTheme.colors,
    background: '#f5f7fa',
    text: '#222',
    primary: baseTheme.colors.primary,
    accent: baseTheme.colors.accent,
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...baseTheme.colors,
    background: '#181818',
    text: '#fff',
    primary: baseTheme.colors.primary,
    accent: baseTheme.colors.accent,
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(customLightTheme);

  useEffect(() => {
    // Add error handling for AsyncStorage
    try {
      AsyncStorage.getItem('DASHBOARD_THEME').then((val) => {
        if (val === 'dark') {
          setIsDarkMode(true);
          setTheme(customDarkTheme);
        }
      }).catch(error => {
        console.error('Error reading theme from AsyncStorage:', error);
      });
    } catch (error) {
      console.error('AsyncStorage not available:', error);
      // Check if system prefers dark mode as fallback (for web)
      if (typeof window !== 'undefined' && 
          window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
        setTheme(customDarkTheme);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      setTheme(next ? customDarkTheme : customLightTheme);
      try {
        AsyncStorage.setItem('DASHBOARD_THEME', next ? 'dark' : 'light')
          .catch(error => console.error('Error saving theme preference:', error));
      } catch (error) {
        console.error('AsyncStorage not available:', error);
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
