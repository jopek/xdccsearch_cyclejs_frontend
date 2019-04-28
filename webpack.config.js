const path = require('path');

const appPath = (...names) => path.join(process.cwd(), ...names);

//This will be merged with the config from the flavor
module.exports = {
    entry: {
        main: [appPath('src', 'main.js'), appPath('src', 'css', 'styles.scss')]
    },
    output: {
        filename: 'bundle.[hash].js',
        path: appPath('build'),
        publicPath: '/'
    },
    devServer: {
        contentBase: path.join(__dirname, './'),
        compress: true,
        hot: true,
        watchContentBase: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080/'
            },
            '/eventbus': {
                target: 'http://127.0.0.1:8080/',
                ws: true,
            },
            '/sev': {
                target: 'http://127.0.0.1:8080/',
                ws: true,
            },
            // '/sev-node': {
            //     target: 'http://127.0.0.1:8080/',
            //     ws: true,
            // }
        }
    },
    // module: {
    //     rules: [
    //         {
    //             test: /\.(s?)css$/,
    //             use: ExtractTextPlugin.extract({
    //                 fallback: 'style-loader',
    //                 use: [
    //                     'css-loader',
    //                     'postcss-loader',
    //                     'sass-loader',
    //                     'resolve-url-loader',
    //                 ]
    //             })
    //         }
    //     ]
    // }
};
