const fs = require('fs');
const path = require('path');

const rootGoogleServices = path.join(__dirname, '..', 'google-services.json');
const androidGoogleServices = path.join(__dirname, '..', 'android', 'app', 'google-services.json');

if (fs.existsSync(rootGoogleServices)) {
  fs.copyFileSync(rootGoogleServices, androidGoogleServices);
  console.log('Copied google-services.json to android/app');
} else {
  console.warn('google-services.json not found at project root');
} 