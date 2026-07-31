const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify/browser'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          assert: require.resolve('assert'),
          url: require.resolve('url'),
          querystring: require.resolve('querystring-es3'),
          fs: false,
          net: false,
          tls: false,
          zlib: false,
          dns: false,
          child_process: false,
          async_hooks: false,
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};