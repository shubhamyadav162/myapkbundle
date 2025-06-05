import React, { useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import { supabase } from '../lib/supabaseClient';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async (userId) => {
    if (!userId) return false;
    
    try {
      // Check if supabase is properly initialized
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Supabase client not properly initialized');
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    // Check active session
    const initSession = async () => {
      try {
        // Check if supabase is properly initialized
        if (!supabase || typeof supabase.auth !== 'object') {
          console.error('Supabase client not properly initialized');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error.message);
        }
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Check admin status
          const adminStatus = await checkAdminStatus(data.session.user.id);
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Exception during session initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    let authListener;
    try {
      // Check if supabase is properly initialized
      if (!supabase || typeof supabase.auth !== 'object' || typeof supabase.auth.onAuthStateChange !== 'function') {
        console.error('Supabase auth listener not available');
        setLoading(false);
        return () => {};
      }

      const { data } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Check admin status when auth state changes
          if (newSession?.user) {
            const adminStatus = await checkAdminStatus(newSession.user.id);
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );
      authListener = data;
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setLoading(false);
    }

    return () => {
      if (authListener?.subscription) {
        try {
          authListener.subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from auth listener:', err);
        }
      }
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signOut: () => supabase.auth.signOut(),
    refreshAdminStatus: async () => {
      if (user?.id) {
        const adminStatus = await checkAdminStatus(user.id);
        setIsAdmin(adminStatus);
        return adminStatus;
      }
      return false;
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
