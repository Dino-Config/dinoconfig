const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');

console.log(process.env.NX_PUBLIC_PATH);
console.log(process.env.NX_PUBLIC_BASE_HREF);

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/dinoconfig_builder'),
    publicPath: process.env.NX_PUBLIC_PATH ?? '/',
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
      baseHref: process.env.NX_PUBLIC_BASE_HREF ?? '/',
      assets: ['./src/favicon.ico', './src/assets', './src/_redirects'],
      styles: ['./src/styles.scss'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin()
  ],
};
