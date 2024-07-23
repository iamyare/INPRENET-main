const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: 'body',
      inlineSource: '.(js|css)$' // Inline all .js and .css files
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
  ]
};
