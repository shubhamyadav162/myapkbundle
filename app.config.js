require('dotenv').config();

// Load environment-specific dotenv file
const fs = require('fs');
const path = require('path');

// Try to load production env file if NODE_ENV is production
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('.env.production'))) {
  require('dotenv').config({ path: '.env.production' });
  // Use console.error for logging to avoid affecting JSON output
  console.error('Loaded production environment variables');
}

module.exports = ({ config }) => {
  // Determine environment
  const isProd = process.env.NODE_ENV === 'production';
  const envPrefix = isProd ? 'PROD_' : '';
  
  // Get the appropriate Supabase URL and keys based on environment
  const supabaseUrl = process.env[`${envPrefix}SUPABASE_URL`] || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env[`${envPrefix}SUPABASE_ANON_KEY`] || process.env.SUPABASE_ANON_KEY;
  
  // Get Lightspeed credentials based on environment
  const lightspeedApiKey = process.env[`${envPrefix}LIGHTSPEED_API_KEY`] || process.env.LIGHTSPEED_API_KEY;
  const lightspeedApiSecret = process.env[`${envPrefix}LIGHTSPEED_API_SECRET`] || process.env.LIGHTSPEED_API_SECRET;
  const lightspeedEnv = isProd ? 'live' : (process.env.LIGHTSPEED_ENV || 'sandbox');
  
  // Set the webhook URLs based on environment
  const appUrl = isProd 
    ? 'https://onebigshow.com' 
    : process.env.APP_URL || 'https://onebigshow-dev.com';
    
  const webhookBaseUrl = isProd
    ? 'https://hjsdcsatfcysrwsryngu.supabase.co/functions/v1'
    : 'https://hjsdcsatfcysrwsryngu.supabase.co/functions/v1';
  
  // Log configuration to stderr instead of stdout to avoid affecting JSON output
  console.error(`Building app config for ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      'expo-font',
    ],
    extra: {
      ...config.extra,
      // Supabase configuration
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey,
      
      // Lightspeed configuration
      LIGHTSPEED_API_KEY: lightspeedApiKey,
      LIGHTSPEED_API_SECRET: lightspeedApiSecret,
      LIGHTSPEED_ENV: lightspeedEnv,
      
      // Webhook URLs
      LIGHTSPEED_WEBHOOK_URL: `${webhookBaseUrl}/confirm-subscription`,
      LIGHTSPEED_SUCCESS_URL: `${appUrl}/payment-success`,
      LIGHTSPEED_FAILURE_URL: `${appUrl}/payment-failure`,
      LIGHTSPEED_WEBHOOK_TOKEN: process.env.LIGHTSPEED_WEBHOOK_TOKEN,
      
      // Environment indicator
      IS_PRODUCTION: isProd,
    },
  };
}; 
