const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/dinoconfig_builder'),
    publicPath: isProd ? '/apps/dinoconfig_builder/' : '/',
  },
  devServer: {
    port: 4201,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: isProd ? '/apps/dinoconfig_builder/' : '/',
      assets: ['./src/favicon.ico', './src/assets', './src/_redirects'],
      styles: ['./src/styles.scss'],
      outputHashing: isProd ? 'all' : 'none',
      optimization: isProd,
    }),
    new NxReactWebpackPlugin(),
  ],
};
