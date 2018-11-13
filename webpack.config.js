var path = require('path');
var webpack = require('webpack')
module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: "mapway.layer.js",

	},
	module: {
		loaders: [{
			test: path.join(__dirname, 'es6'),
			loader: 'babel-loader',
			exclude: /node_modules/,
			query: {
				presets: ['es2015']
			}
		}]
	},
	devServer: {
		historyApiFallback: true,
		hot: true,
		inline: true,
		progress: true, //报错无法识别，删除后也能正常刷新
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE.ENV':"development"
		}),
		// https://github.com/glenjamin/webpack-hot-middleware#installation--usage
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		// https://github.com/ampedandwired/html-webpack-plugin

	]
}