import axios from 'axios';
import Constants from 'expo-constants';

// Destructure LightSpeedPay keys from Expo config
const { LIGHTSPEED_API_KEY, LIGHTSPEED_API_SECRET, LIGHTSPEED_ENV } = Constants.expoConfig.extra || {};

const API_BASE_URL = 'https://api.lightspeedpay.in/api/v1';

/**
 * Initiate a LightSpeedPay transaction and return the payment link
 * @param {object} params - Transaction parameters
 * @param {string} params.customerName - Name of the customer
 * @param {number} params.amount - Amount in INR
 * @param {string} params.billId - Unique bill/order identifier
 * @param {string} params.vpaId - UPI VPA (optional)
 * @param {string} params.description - Transaction description
 * @param {string} [params.method='Qr'] - Payment method
 * @param {string} [params.status='success'] - Status flag for initiation
 * @returns {Promise<object>} - The API response
 */
const initiateTransaction = async ({ customerName, amount, billId, vpaId = '', description, method = 'Qr', status = 'success', type = LIGHTSPEED_ENV || 'sandbox' }) => {
  try {
    const endpoint = type === 'sandbox'
      ? `${API_BASE_URL}/transaction/sandbox/initiate-transaction`
      : `${API_BASE_URL}/transaction/initiate-transaction`;

    const payload = {
      customerName,
      status,
      method,
      description,
      amount,
      billId,
      vpaId,
      apiKey: LIGHTSPEED_API_KEY,
      apiSecret: LIGHTSPEED_API_SECRET,
      type,
    };

    const response = await axios.post(endpoint, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.error('LightSpeedPay initiateTransaction error', error);
    throw error;
  }
};

export default { initiateTransaction }; 
