import { supabase } from '../lib/supabaseClient';

const usersApi = {
  /**
   * Create or update a user profile in Supabase
   * @param {object} user - User data (uid, email, name, optional role, status)
   */
  createUserProfile: async ({ uid, email, name }) => {
    const { error } = await supabase
      .from('profiles')
      .upsert([{ user_id: uid, full_name: name }]);
    if (error) console.error('usersApi.createUserProfile error', error.message);
  },

  /**
   * Subscribe to real-time updates of the users collection
   * @param {function} callback - Called with array of user profiles
   * @returns {function} unsubscribe
   */
  subscribeToUsers: (callback) => {
    // Initial fetch
    usersApi.getUsers().then(callback);
    // Real-time subscription
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        usersApi.getUsers().then(callback);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  /**
   * Fetch all user profiles once
   * @returns {Promise<Array>} Array of user profiles
   */
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) {
      console.error('usersApi.getUsers error', error.message);
      return [];
    }
    return data;
  },
};

export default usersApi; 
