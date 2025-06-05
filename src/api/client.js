import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API base URL (dynamically use localhost or Android emulator loopback)
const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_BASE_URL = `http://${defaultHost}:54321`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('userToken');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Attempt to refresh token or redirect to login
      try {
        // Get refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Attempt to get new token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          // Store new tokens
          const { accessToken, newRefreshToken } = response.data;
          await AsyncStorage.setItem('userToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          // Update authorization header and retry request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          // No refresh token, redirect to login
          // This should be handled by your auth context
          await AsyncStorage.removeItem('userToken');
          // You may want to dispatch an event to notify the app
          // that the user should be logged out
        }
      } catch (refreshError) {
        // Failed to refresh token
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 
