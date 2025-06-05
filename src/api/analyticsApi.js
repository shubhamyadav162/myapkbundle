/**
 * Analytics API service using Supabase
 */
const analyticsApi = {
  /**
   * Log an analytics event
   * @param {string} eventType
   * @param {object} payload
   */
  logEvent: async (eventType, payload) => {
    // Analytics disabled
  },

  /**
   * Fetch overview metrics for the dashboard
   */
  getOverview: async () => {
    // Analytics disabled
    return {
      totalViews: 0,
      activeUsers: 0,
      avgWatchTime: 0,
      completionRate: 0,
      topContent: '',
      newSubscribers: 0,
    };
  },
};

export default analyticsApi; 
