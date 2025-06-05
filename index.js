// Setup global polyfills for React Native
import 'cross-fetch/polyfill';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Make sure the global.URL comes from our polyfill
global.URL = require('react-native-url-polyfill').URL;

// Create empty stubs for Node.js built-ins
global.Buffer = global.Buffer || require('buffer').Buffer;
global.process = global.process || {
  env: { NODE_ENV: process.env.NODE_ENV || 'development' },
  version: '',
  nextTick: (cb) => setTimeout(cb, 0),
};

// Redirect imports to empty implementations
const noop = () => {};
global.TextDecoder = global.TextDecoder || function TextDecoder() {
  return { decode: () => '' };
};
global.TextEncoder = global.TextEncoder || function TextEncoder() {
  return { encode: () => new Uint8Array() };
};

// Load Expo entry point
require('./node_modules/expo/AppEntry'); 
