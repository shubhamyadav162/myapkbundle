import axios from 'axios';

// Placeholder base URL; replace with your real payment gateway or backend endpoint
const API_BASE = 'https://your-backend.com/api';

const getPayments = async () => {
  const response = await axios.get(`${API_BASE}/payments`);
  // Expect response.data to be an array of payment objects with { transactionId, userEmail, amount, status, date }
  return response.data;
};

export default { getPayments }; 
