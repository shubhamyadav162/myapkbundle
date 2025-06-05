import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Replace these placeholder values with your actual Supabase URL and anon key
// In production, these would be loaded from .env or expo-constants
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder-anon-key';

// Custom storage implementation for AsyncStorage
const ExpoAsyncStorageAdapter = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.log('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log('Error removing item from AsyncStorage:', error);
    }
  },
};

// Function to safely create the client, with error handling
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoAsyncStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Return a mock client that won't throw errors when methods are called
    return {
      auth: {
        signInWithOAuth: async () => ({ error: new Error('Supabase not initialized') }),
        getSessionFromUrl: async () => ({ error: new Error('Supabase not initialized') }),
      },
    };
  }
};

// Initialize the Supabase client with AsyncStorage adapter
export const supabase = createSupabaseClient(); 
