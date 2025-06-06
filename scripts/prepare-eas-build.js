const fs = require('fs');
const path = require('path');

const rootGoogleServices = path.join(__dirname, '..', 'google-services.json');
const androidAppDir = path.join(__dirname, '..', 'android', 'app');
const androidGoogleServices = path.join(androidAppDir, 'google-services.json');

// Create a default google-services.json if it doesn't exist
if (!fs.existsSync(rootGoogleServices)) {
  console.log('Creating a placeholder google-services.json file');
  const placeholderContent = {
    "project_info": {
      "project_number": "000000000000",
      "project_id": "placeholder-project",
      "storage_bucket": "placeholder-project.appspot.com"
    },
    "client": [{
      "client_info": {
        "mobilesdk_app_id": "1:000000000000:android:0000000000000000",
        "android_client_info": {
          "package_name": "com.placeholder.app"
        }
      },
      "api_key": [{
        "current_key": "placeholder-api-key"
      }],
      "services": {}
    }]
  };
  
  fs.writeFileSync(rootGoogleServices, JSON.stringify(placeholderContent, null, 2));
  console.log('Created placeholder google-services.json at project root');
}

// Make sure the android/app directory exists
if (!fs.existsSync(androidAppDir)) {
  fs.mkdirSync(androidAppDir, { recursive: true });
  console.log('Created android/app directory');
}

// Copy the file
fs.copyFileSync(rootGoogleServices, androidGoogleServices);
console.log('Copied google-services.json to android/app'); 
