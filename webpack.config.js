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
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
			}
		})
	]
};

if (process.env.NODE_ENV === 'production') {
	module.exports.plugins.push(new UglifyJsPlugin());
}
