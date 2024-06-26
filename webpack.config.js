var path = require('path');
const config = {
  entry: {
    app: [
      './client/app.jsx',
      './client/component/header/header.js',
      './client/component/index/index.js',
      './routes/root.js',
      './routes/about.js',
    ]
  },
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
      },
      {
        test: /\.(css)$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
module.exports = config;