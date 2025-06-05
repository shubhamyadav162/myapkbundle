module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@react-native-vector-icons/material-design-icons': '@expo/vector-icons/MaterialCommunityIcons',
            'firebase/app': './node_modules/firebase/app/dist/index.cjs.js',
            'firebase/auth': './node_modules/firebase/auth/dist/index.cjs.js',
            'firebase/firestore': './node_modules/firebase/firestore/dist/index.cjs.js',
            'firebase/functions': './node_modules/firebase/functions/dist/index.cjs.js',
            'firebase/storage': './node_modules/firebase/storage/dist/index.cjs.js',
            'http': './ws-empty.js',
            'https': './ws-empty.js',
            'zlib': './ws-empty.js',
            'net': './ws-empty.js',
            'tls': './ws-empty.js',
            'fs': './ws-empty.js',
            'child_process': './ws-empty.js',
            'url': 'react-native-url-polyfill'
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
}; 