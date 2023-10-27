const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin,} = require('clean-webpack-plugin');
module.exports = {
  entry: {
    index: './src/index.ts',
    workerLoad: './src/workerLoad.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Hello, world!',
      template: path.resolve(__dirname, './src/template.html'),
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    compress: true,
    port: 3001,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    alias: {
      src: path.join(__dirname, "src"),
      "raster-images": path.normalize(path.join(__dirname, "..", "..", "src")),
    },
    fallback: {
      "buffer": false,
      "util": false,
    },
    extensions: [
      '.tsx',
      '.ts',
      '.js',
    ],
  },
};
