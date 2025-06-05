# Big Show OTT App

This repository contains the Big Show OTT app built with Expo and React Native.

## Prerequisites

- Node.js >= 14
- npm or yarn
- Expo CLI and EAS CLI (install globally):  
  ```
  npm install -g expo-cli eas-cli
  ```
- Expo account: run `expo login`

## Setup

Install dependencies and prepare native configuration:

```bash
npm install
npm run prepare-eas-build
```

## EAS Build Profiles

- Development (with custom dev client)  
  ```bash
  npm run build:development
  ```

- Preview (internal distribution APK)  
  ```bash
  npm run build:preview
  ```

- Production (store-ready APK)  
  ```bash
  npm run build:production
  ```

## Environment Variables

This project uses environment variables for configuration. Secrets should be added via EAS:

```bash
eas secret:create SUPABASE_URL --value "<your_supabase_url>"
eas secret:create SUPABASE_ANON_KEY --value "<your_supabase_anon_key>"
# add other secrets similarly
```

During EAS build, the `prepare-eas-build` script will copy `google-services.json` into the native Android project.

## Downloading Artifacts

After the build completes, download the APK from the link provided in the CLI or in the expo.dev dashboard. 