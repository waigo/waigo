module.exports = {
  context: __dirname + "/src/assets/js/admin",
  entry: './main',
  output: {
    filename: 'admin.js'
  },
  devtool: 'inline-source-map',
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'jsx-loader',
      exclude: /node_modules/
    }],
  },
};
