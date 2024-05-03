var path = require('path');
const config = {
  entry: './client/app.jsx',
  output: {
    path: path.resolve(__dirname, './public/dist/'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/env", "@babel/react"]
        }
      }
    ]
  }
};
module.exports = config;