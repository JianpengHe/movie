const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackBar = require('webpackbar')
const { PROJECT_PATH } = require('../constant')

module.exports = {
  entry: {
    app: path.resolve(PROJECT_PATH, './src/admin/index.tsx'),
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, { loader: 'css-loader' }],
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, { loader: 'css-loader' }, { loader: 'less-loader' }],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      frontend: path.resolve(PROJECT_PATH, './admin'),
      components: path.resolve(PROJECT_PATH, './admin/components'),
      utils: path.resolve(PROJECT_PATH, './admin/utils'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(PROJECT_PATH, './src/public/admin.html'),
    }),
    new WebpackBar({
      name: '编译',
      color: '#52c41a',
    }),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       // context: 'public',
    //       from: path.resolve(PROJECT_PATH, './public'),
    //       to: path.resolve(PROJECT_PATH, '../dist/public'),
    //       toType: 'dir',
    //       globOptions: {
    //         dot: true,
    //         gitignore: true,
    //         ignore: ['**/index.html'], // **表示任意目录下
    //       },
    //     },
    //   ],
    // }),
  ],
}
