import path from 'path';
import fs from 'fs';

import webpack from 'webpack';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import SpritePlugin from 'svg-sprite-loader/lib/plugin';

import lessToJs from 'less-vars-to-js';

const updateIndexHTML = require('./tools/updateIndexHTML');

const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, './theme/ant-theme-vars.less'), 'utf8'));

const extractCss = new ExtractTextPlugin('app.[contenthash].css');
const extractAntd = new ExtractTextPlugin('antd.[contenthash].css');

const svgSprite = new SpritePlugin({plainSprite: false});

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

const postcssOpts = {
  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
  plugins: () => [
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    }),
    // pxtorem({ rootValue: 100, propWhiteList: [] })
  ],
};

export default {
  // debug: false,
  // devtool: false, // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  // noInfo: true, // set to false to see a list of every file being bundled.
  entry: ['babel-polyfill', './src/index'],
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'app.[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS), // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    extractAntd,
    extractCss,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      filename: `${__dirname}/dist/index.html`,
      template: `${__dirname}/src/index.html`,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    new updateIndexHTML(),
    svgSprite
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, exclude: /node_modules/, loader: 'babel-loader',
        options: {
          plugins: [
            'external-helpers', // why not work?
            ["transform-runtime", { polyfill: false }],
            ["import", [{ "style": true, "libraryName": "antd" }]]
          ],
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.bundle\.js$/,
        use: {
          loader: 'bundle-loader',
          options: {
            name: '[name]'
          }
        }
      },
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader'},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[hash:4].[ext]'},
      {
        test: /\.less$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader', options: postcssOpts
            },
            {
              loader: "less-loader",
              options: {
                modifyVars: themeVariables
              }
            }
          ]
        })
      },
      {
        test: /\.css$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', { loader: 'postcss-loader', options: postcssOpts }
          ]
        })
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: path.resolve('./assets/icons'),
        options: {
          extract: true,
          spriteFilename: 'app.icons.[hash:6].svg'
        }
      },
    ]
  }
};
