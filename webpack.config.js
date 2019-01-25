var path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env) => {
    const isProduction = env === 'production';
    const CSSExtract = new ExtractTextPlugin('styles.css');
    const webpack = require('webpack');
    return {
        entry: ['babel-polyfill', './src/app.js'],
        "output": {
            "path": path.join(__dirname, 'public', 'dist'),
            "filename": 'bundle.js'
        },
        module: {
            rules: [{
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            }, {
                test: /\.s?css$/,
                use: CSSExtract.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                })
            }]
        },
        plugins: [
            CSSExtract,
            new WriteFilePlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"development"',
                    'REACT_APP_PUBLISH_KEY': '"pk_test_cGqHVLV27D9kYA8UN9XsjTVC"'
                }
            })
        ],
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            historyApiFallback: true,
            publicPath: '/dist/'
        }
    }
}
