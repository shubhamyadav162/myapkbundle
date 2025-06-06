// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const customConfig = {
  resolver: {
    extraNodeModules: {
      ws: path.resolve(__dirname, 'ws-empty.js'),
      stream: path.resolve(__dirname, 'ws-empty.js'),
    },
  },
};

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  ...customConfig.resolver,
};
module.exports = defaultConfig;
