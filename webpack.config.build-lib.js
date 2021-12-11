const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const filename = argv.mode === 'production' ? `[name].min.js` : `[name].develop.js`;
    const conf = {
        mode: 'development',
        devServer: {
            open: true,
            openPage: [`client/example.html`],
            contentBase: path.join(__dirname, '/'),
            watchContentBase: true,
            port: 8080,
            host: argv.mode === 'production' ? `localhost` : `localhost`,
            disableHostCheck: true,
        },
        entry: {
            'SwarmNFT': [`./src/SwarmNFT.js`],
        },
        output: {
            path: path.join(__dirname, '/'),
            filename: filename,
            // sourceMapFilename: filename + '.map',
            library: 'SwarmNFT',
            libraryExport: 'default',
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        externals: {
            // axios: {
            //     commonjs: 'axios',
            //     commonjs2: 'axios',
            //     amd: 'axios',
            //     root: 'axios'
            // },
            // stream: {
            //     commonjs: 'stream',
            //     commonjs2: 'stream',
            //     amd: 'stream',
            //     root: 'stream'
            // }
        },
        // plugins: [
        //     'transform-es2015-arrow-functions',
        //     'transform-es2015-block-scoping',
        //     'transform-es2015-parameters'
        // ],
        optimization: {
            minimizer: [new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                }
            })],
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: 'babel-loader',
                }]
            }]
        },
    };

    if (argv.mode !== 'production') {
        conf.devtool = 'inline-source-map';
    }

    return conf;

};
