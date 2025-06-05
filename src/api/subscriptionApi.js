import apiClient from './client';

/**
 * Subscription and payment API service
 */
const subscriptionApi = {
  /**
   * Get available subscription plans
   * @returns {Promise} - API response
   */
  getSubscriptionPlans: async () => {
    try {
      const response = await apiClient.get('/subscriptions/plans');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription plans',
      };
    }
  },

  /**
   * Get user's current subscription
   * @returns {Promise} - API response
   */
  getCurrentSubscription: async () => {
    try {
      const response = await apiClient.get('/subscriptions/current');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch current subscription',
      };
    }
  },

  /**
   * Subscribe to a plan
   * @param {string} planId - Plan ID
   * @param {object} paymentDetails - Payment details
   * @returns {Promise} - API response
   */
  subscribeToPlan: async (planId, paymentDetails) => {
    try {
      const response = await apiClient.post('/subscriptions/subscribe', {
        planId,
        paymentDetails,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to subscribe to plan',
      };
    }
  },

  /**
   * Change subscription plan
   * @param {string} newPlanId - New plan ID
   * @returns {Promise} - API response
   */
  changeSubscriptionPlan: async (newPlanId) => {
    try {
      const response = await apiClient.post('/subscriptions/change-plan', {
        newPlanId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change subscription plan',
      };
    }
  },

  /**
   * Cancel subscription
   * @returns {Promise} - API response
   */
  cancelSubscription: async () => {
    try {
      const response = await apiClient.post('/subscriptions/cancel');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription',
      };
    }
  },

  /**
   * Reactivate canceled subscription
   * @returns {Promise} - API response
   */
  reactivateSubscription: async () => {
    try {
      const response = await apiClient.post('/subscriptions/reactivate');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reactivate subscription',
      };
    }
  },

  /**
   * Get payment methods
   * @returns {Promise} - API response
   */
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payments/methods');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment methods',
      };
    }
  },

  /**
   * Add payment method
   * @param {object} paymentMethodDetails - Payment method details
   * @returns {Promise} - API response
   */
  addPaymentMethod: async (paymentMethodDetails) => {
    try {
      const response = await apiClient.post('/payments/methods', paymentMethodDetails);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add payment method',
      };
    }
  },

  /**
   * Update payment method
   * @param {string} paymentMethodId - Payment method ID
   * @param {object} paymentMethodDetails - Updated payment method details
   * @returns {Promise} - API response
   */
  updatePaymentMethod: async (paymentMethodId, paymentMethodDetails) => {
    try {
      const response = await apiClient.put(`/payments/methods/${paymentMethodId}`, paymentMethodDetails);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update payment method',
      };
    }
  },

  /**
   * Delete payment method
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise} - API response
   */
  deletePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await apiClient.delete(`/payments/methods/${paymentMethodId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete payment method',
      };
    }
  },

  /**
   * Get payment history
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise} - API response
   */
  getPaymentHistory: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/payments/history', {
        params: { page, limit },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment history',
      };
    }
  },

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} - API response
   */
  getInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/payments/invoices/${invoiceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch invoice',
      };
    }
  },
};

export default subscriptionApi; 
