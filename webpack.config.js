var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = function (production) {
    var config = {
        entry: ['./src/js/PDFViewer.js'],
        output: {
            path: 'dist',
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        plugins: ['transform-runtime'],
                        presets: ['es2015']
                    }
                },
                {
                    test: /\.scss/,
                    exclude: /node_modules/,
                    loader: ExtractTextPlugin.extract('style', 'css!sass')
                },
                {
                    test: /\.hbs$/,
                    exclude: /node_modules/,
                    loader: "handlebars-loader",
                    query: {
                        helperDirs: [
                            __dirname + "/src/templates/helpers",
                            __dirname + "/modules/shared/handlebars/helpers"
                        ]
                    }
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin("styles.css")
        ],
        devtool: "#inline-source-map"
    }

    if (production) {
        delete config.devtool;
    }

    return config;
};