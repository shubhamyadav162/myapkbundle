import { supabase } from '../lib/supabaseClient';

/**
 * Content API service using Supabase
 */
const contentApi = {
  /**
   * Get featured content for the home screen
   * @returns {Promise} - API response
   */
  getFeaturedContent: async () => {
    const { data, error } = await supabase
      .from('content_series')
      .select('*')
      .limit(10);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get recommended content based on user preferences
   * @returns {Promise} - API response
   */
  getRecommendedContent: async () => {
    return contentApi.getFeaturedContent();
  },

  /**
   * Get trending content
   * @returns {Promise} - API response
   */
  getTrendingContent: async () => {
    return contentApi.getFeaturedContent();
  },

  /**
   * Get content by category
   * @param {string} categoryId - Category ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise} - API response
   */
  getContentByCategory: async (categoryId, page = 1, limit = 20) => {
    const { data, error } = await supabase
      .from('content_series')
      .select('*')
      .eq('genre', categoryId)
      .range((page - 1) * limit, page * limit - 1);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get all categories
   * @returns {Promise} - API response
   */
  getCategories: async () => {
    const { data, error } = await supabase
      .from('content_series')
      .select('genre')
      .neq('genre', null);
    if (error) return { success: false, error: error.message };
    const genres = Array.from(new Set(data.map(item => item.genre)));
    return { success: true, data: genres };
  },

  /**
   * Search content by title, description, or cast
   * @param {string} queryStr - Search query
   * @returns {Promise} - API response
   */
  searchContent: async (queryStr) => {
    const { data, error } = await supabase
      .from('content_series')
      .select('*')
      .or(
        `title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`
      );
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get content details by ID
   * @param {string} contentId - Content ID
   * @returns {Promise} - API response
   */
  getContentDetails: async (contentId) => {
    const { data, error } = await supabase
      .from('content_series')
      .select('*')
      .eq('id', contentId)
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get episodes for a series
   * @param {string} seriesId - Series ID
   * @returns {Promise} - API response
   */
  getEpisodes: async (seriesId) => {
    const { data, error } = await supabase
      .from('content_episodes')
      .select('*')
      .eq('series_id', seriesId);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get episode details by ID
   * @param {string} seriesId - Series ID
   * @param {string} episodeId - Episode ID
   * @returns {Promise} - API response
   */
  getEpisodeDetails: async (seriesId, episodeId) => {
    const { data, error } = await supabase
      .from('content_episodes')
      .select('*')
      .eq('series_id', seriesId)
      .eq('id', episodeId)
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get similar content recommendations
   * @param {string} contentId - Content ID
   * @param {number} limit - Number of recommendations to fetch
   * @returns {Promise} - API response
   */
  getSimilarContent: async (contentId, limit = 10) => {
    const {
      data: main,
      error: mainError,
    } = await supabase
      .from('content_series')
      .select('genre')
      .eq('id', contentId)
      .single();
    if (mainError || !main) return { success: false, error: mainError?.message || 'Content not found' };
    const genre = main.genre;
    const { data, error } = await supabase
      .from('content_series')
      .select('*')
      .eq('genre', genre)
      .neq('id', contentId)
      .limit(limit);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  /**
   * Get cast and crew details for content
   * @returns {Promise} - API response
   */
  getCastCrew: async () => {
    return { success: true, data: [] };
  },
};

export default contentApi; 
