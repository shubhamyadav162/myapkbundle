import { supabase } from '../lib/supabase';

/**
 * चेक करें कि यूजर का सब्सक्रिप्शन एक्टिव है या नहीं
 * @param {string} userId - यूजर आईडी
 * @returns {Promise<boolean>} सब्सक्रिप्शन स्टेटस
 */
export const checkSubscriptionStatus = async (userId) => {
  try {
    if (!userId) return false;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking subscription:', error);
      return false;
    }

    if (!data) return false;

    // चेक करें कि सब्सक्रिप्शन एक्टिव है और एक्सपायर नहीं हुआ है
    const isActive = data.subscription_status === 'active';
    const hasExpired = data.subscription_end_date 
      ? new Date(data.subscription_end_date) < new Date() 
      : true;

    // यदि सब्सक्रिप्शन एक्सपायर हो गया है, तो उसे अपडेट करें
    if (isActive && hasExpired) {
      await updateSubscriptionStatus(userId, 'expired');
      return false;
    }

    return isActive && !hasExpired;
  } catch (error) {
    console.error('Subscription check error:', error);
    return false;
  }
};

/**
 * यूजर सब्सक्रिप्शन स्टेटस अपडेट करें
 * @param {string} userId - यूजर आईडी
 * @param {string} status - नया स्टेटस (active, expired, cancelled)
 * @returns {Promise<boolean>} - सफलता स्टेटस
 */
export const updateSubscriptionStatus = async (userId, status) => {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        subscription_status: status,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update subscription error:', error);
    return false;
  }
};

/**
 * यूजर के एक्टिव सब्सक्रिप्शन प्लान की डिटेल्स प्राप्त करें
 * @param {string} userId - यूजर आईडी
 * @returns {Promise<Object|null>} - सब्सक्रिप्शन प्लान डिटेल्स
 */
export const getActiveSubscriptionPlan = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('subscription_status', 'active')
      .single();

    if (error) {
      console.error('Error fetching subscription plan:', error);
      return null;
    }

    return data?.subscription_plans || null;
  } catch (error) {
    console.error('Get subscription plan error:', error);
    return null;
  }
};

/**
 * सब्सक्रिप्शन प्लैन्स की लिस्ट प्राप्त करें
 * @returns {Promise<Array>} - सब्सक्रिप्शन प्लैन्स की लिस्ट
 */
export const getSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
};

/**
 * यूजर के पेमेंट ट्रांजैक्शन हिस्ट्री प्राप्त करें
 * @param {string} userId - यूजर आईडी
 * @returns {Promise<Array>} - ट्रांजैक्शन की लिस्ट
 */
export const getPaymentHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        subscription_plans(name, price, duration_days)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

/**
 * कंटेंट को एक्सेस करने के लिए सब्सक्रिप्शन आवश्यक है या नहीं
 * @param {string} contentId - कंटेंट आईडी
 * @returns {Promise<boolean>} - क्या सब्सक्रिप्शन आवश्यक है
 */
export const isSubscriptionRequired = async (contentId) => {
  try {
    // यह आपके कंटेंट मॉडल पर निर्भर करेगा, यहां एक उदाहरण दिया गया है
    const { data, error } = await supabase
      .from('content')
      .select('requires_subscription')
      .eq('id', contentId)
      .single();

    if (error) throw error;
    return data?.requires_subscription || false;
  } catch (error) {
    console.error('Error checking if subscription required:', error);
    return true; // सेफ्टी के लिए डिफॉल्ट: सब्सक्रिप्शन आवश्यक है
  }
}; 
