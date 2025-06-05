// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude nested OneBigShowOTT directory and ws module to avoid duplicate module errors and Node-specific ws files
config.resolver.blockList = exclusionList([
  /OneBigShowOTT[\/\\]OneBigShowOTT[\/\\].*/,
  /node_modules[\/\\]ws[\/\\].*/,
]);

// Add support for all file extensions supported by Expo
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'cjs', 'mjs', 'json',
  ...config.resolver.sourceExts,
];

// Add support for all asset extensions supported by Expo
config.resolver.assetExts = [
  'ttf', 'otf', 'png', 'jpg', 'jpeg', 'gif', 'webp',
  'mp4', 'mp3', 'wav', 'ogg', 'webm',
  ...config.resolver.assetExts,
];

// Allow transforming TypeScript in node_modules, including react-native-rapi-ui
config.transformer.nodeModulesTransform = {
  type: 'all',
};

// Stub out ws and stream modules to avoid bundling Node-specific implementation
config.resolver.extraNodeModules = {
  ws: path.resolve(__dirname, 'ws-empty.js'),
  stream: path.resolve(__dirname, 'ws-empty.js'),
};

// Use the default React Native and browser-first resolution order
config.resolver.mainFields = ['react-native', 'browser', 'main'];

module.exports = config; 