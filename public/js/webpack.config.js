module.exports = {
  context: __dirname + "/src/assets/js/admin",
  entry: './main',
  output: {
    filename: 'admin.js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'jsx-loader!babel-loader?experimental&optional=runtime',
      exclude: /node_modules/
    }],
  },
};
