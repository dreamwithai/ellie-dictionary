const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/sw.js', to: 'sw.js' },
        { from: 'public/icon.svg', to: 'icon.svg' },
        { from: 'public/favicon-16x16.png', to: 'favicon-16x16.png' },
        { from: 'public/favicon-32x32.png', to: 'favicon-32x32.png' },
        { from: 'public/apple-touch-icon.png', to: 'apple-touch-icon.png' },
        { from: 'public/icons-192x192.png', to: 'icons-192x192.png' },
        { from: 'public/icon-512x512.png', to: 'icon-512x512.png' },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000,
    hot: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
}; 