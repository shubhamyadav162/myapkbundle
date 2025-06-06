// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Add additional asset extensions
defaultConfig.resolver.assetExts.push('cjs');

// Add custom node modules resolution
defaultConfig.resolver.extraNodeModules = {
  ws: path.resolve(__dirname, 'ws-empty.js'),
  stream: path.resolve(__dirname, 'ws-empty.js'),
};

// Ensure proper serialization of app config
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = defaultConfig;
