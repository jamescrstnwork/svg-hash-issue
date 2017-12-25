import path from 'path';
import fs from 'fs';

import webpack from 'webpack';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import SpritePlugin from 'svg-sprite-loader/lib/plugin';

import lessToJs from 'less-vars-to-js';

const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, './theme/ant-theme-vars.less'), 'utf8'));
const svgSprite = new SpritePlugin({plainSprite: false});

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('development'),
  __DEV__: true
};

const Visualizer = require('webpack-visualizer-plugin'); // remove it in production environment.
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // remove it in production environment.
const otherPlugins = process.argv[1].indexOf('webpack-dev-server') >= 0 ? [] : [
  new Visualizer(), // remove it in production environment.
  new BundleAnalyzerPlugin({
    defaultSizes: 'parsed',
    // generateStatsFile: true,
    statsOptions: { source: false }
  }), // remove it in production environment.
];

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
  devtool: 'source-map', // or 'inline-source-map'
  entry: [
    './src/webpack-public-path',
    'webpack-hot-middleware/client?reload=true',
    './src/index'
  ],
  // target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.join(__dirname, 'src')
    ],
    extensions: ['.web.js', '.jsx', '.js', '.json'],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: false
    }),
    new webpack.DefinePlugin(GLOBALS),// Tells React to build in prod mode. https://facebook.github.io/react/downloads.htmlnew webpack.HotModuleReplacementPlugin());
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('shared'),
    new ExtractTextPlugin({ filename: '[name].css', allChunks: true }),
    // new ExtractTextPlugin({ filename: '[name].html', allChunks: true }),
    svgSprite,
    ...otherPlugins
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [
            'external-helpers', // why not work?
            ["transform-runtime", { polyfill: false }],
            ["import", [{ "style": true, "libraryName": "antd-mobile" }]]
          ],
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.bundle\.js$/,
        use: {
          loader: 'bundle-loader',
          options: {
            lazy: true,
            name: '[name]'
          }
        }
      },
      {test: /\.html$/, loader: 'file-loader'},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader'},
      {test: /\.(woff|woff2)$/, loader: 'file-loader?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          spriteFilename: 'app.icons.[hash:6].svg'
        }
      },
      { test: /\.(jpg|png)$/, loader: "url-loader?limit=8192" },
      { test: /\.ico$/, loader: 'file-loader?name=[name].[hash:4].[ext]'},
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
      }
    ]
  }
};
