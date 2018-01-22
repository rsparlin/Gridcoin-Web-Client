const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	context: __dirname + '/content/js/',
	entry: './index.jsx',
	output: {
		filename: 'bundle.js',
		path: __dirname + '/content/',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					cacheDirectory: true,
					presets: ['react', 'es2015']
				}
			}
		]
	},
	plugins: (process.env.PROD === '1') ? [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new UglifyJsPlugin()
	] : []
};
