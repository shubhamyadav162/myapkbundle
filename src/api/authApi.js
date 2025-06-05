import { supabase } from '../lib/supabaseClient';

/**
 * Supabase Authentication API service
 */
const authApi = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };  
    return { success: true, data: data.user };
  },

  /**
   * Register a new user
   */
  register: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: 'bigshow://' }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data.user };
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Reset password (update current user password)
   */
  resetPassword: async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Logout user
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};

export default authApi; 
