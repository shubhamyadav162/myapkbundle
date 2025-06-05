// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Environment variables
const isProd = process.env.NODE_ENV === 'production';

// Supabase URLs
const SUPABASE_URL = isProd 
  ? process.env.VITE_SUPABASE_URL || 'https://hjsdcsatfcysrwsryngu.supabase.co'
  : 'https://hjsdcsatfcysrwsryngu.supabase.co';

// Supabase anon keys - Use the correct API key
const SUPABASE_ANON_KEY = isProd
  ? process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDIwOTEsImV4cCI6MjA2MjY3ODA5MX0.X1m5n0q-bw4p7tetegdjq-uQoSVypPmrlko4_SZXjgw'
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDIwOTEsImV4cCI6MjA2MjY3ODA5MX0.X1m5n0q-bw4p7tetegdjq-uQoSVypPmrlko4_SZXjgw';

// Initialize Supabase with robust error handling
const createSupabaseClient = () => {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      // React Native-specific options
      global: {
        fetch: fetch, // Use global fetch instead of Node-specific fetch
      },
      // Disable features that use Node.js modules
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    // Return a mock client that won't throw errors when methods are called
    return {
      auth: {
        signInWithPassword: async () => ({ error: new Error('Supabase not initialized') }),
        signUp: async () => ({ error: new Error('Supabase not initialized') }),
        signOut: async () => ({ error: new Error('Supabase not initialized') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: null, error: new Error('Supabase not initialized') }),
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not initialized') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          }),
        }),
      }),
      functions: {
        invoke: async () => ({ error: new Error('Supabase not initialized') }),
      }
    };
  }
};

// Create and export the Supabase client
export const supabase = createSupabaseClient();

// Log environment for debugging
if (__DEV__) {
  console.log(`[Supabase] Running in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  console.log(`[Supabase] URL: ${SUPABASE_URL}`);
} 
