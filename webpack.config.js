const path = require('path');
const loaderUtils = require('loader-utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
// 获取当前工作目录
const PROJECT_PATH = path.resolve(__dirname, '../');
// 从相对路径中解析绝对路径
const resolveApp = (relativePath) => path.resolve(PROJECT_PATH, relativePath);

const isDev = process.env.NODE_ENV === 'development';

const getLocalIdentFn = isDev => {
    return (
        context,
        localIdentName,
        localName,
        options
    ) => {
        // 获取更好命名，移除根目录、src目录，并替换/为-
        const className = context.context
            // remove root context
            .replace(context.rootContext, '')
            // remove src
            .replace('/src/', '')
            .replace(/\//g, '-')
            + '_'
            + localName;

        // 获取hash数字
        const hash = loaderUtils.getHashDigest(
            className,
            'md5',
            'base64',
            8
        );

        // 是否增加hash到className上
        const isUseHashClassNameInProd = false;

        return isDev
            ? className
            : (
                isUseHashClassNameInProd
                    ? hash
                    : className
            );
    };
};

const getStyleLoaders = (isDev, cssLoaderOptions = {}, preLoader) => {

    const loaders = [
        // style-loader makes HMR possable, MiniCssExtractPlugin does not
        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

        {
            loader: 'css-loader',
            options: Object.assign({
                sourceMap: isDev
            }, cssLoaderOptions)
        },

        {
            loader: 'postcss-loader',
            options: {
                // necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                // https://github.com/postcss/postcss-loader#plugins
                ident: 'postcss',
                plugins: () => {
                    return [
                        // require('postcss-flexbugs-fixes'),

                        // default stage:2 https://preset-env.cssdb.org/features#stage-2
                        require('postcss-preset-env')({
                            autoprefixer: {
                                // add prefixes only for final and IE versions of specification
                                flexbox: 'no-2009'
                            }
                        })
                    ];
                }
            }
        }
    ];

    if (preLoader) {
        loaders.push(preLoader);
    }

    return loaders;
};

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.css$/,
                        exclude: /\.module\.css$/,
                        use: getStyleLoaders(isDev, {
                            importLoaders: 1
                        }),
                        // Import css even if package claims to have no side effects.
                        // https://github.com/webpack/webpack/issues/6571
                        sideEffects: true
                    },
                    {
                        test: /\.module\.css$/,
                        use: getStyleLoaders(isDev, {
                            importLoaders: 1,
    
                            // css modules
                            modules: {
                                getLocalIdent: getLocalIdentFn(isDev)
                            }
                        })
                    },
                    {
                        test: /\.less$/,
                        exclude: /\.module\.less$/,
                        use: getStyleLoaders(
                            isDev,
                            {
                                importLoaders: 2
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    sourceMap: isDev
                                }
                            }
                        ),
                        // Import css even if package claims to have no side effects.
                        // https://github.com/webpack/webpack/issues/6571
                        sideEffects: true
                    },
                    {
                        test: /\.module\.less$/,
                        use: getStyleLoaders(
                            isDev,
                            {
                                importLoaders: 2,
    
                                // css modules
                                modules: {
                                    getLocalIdent: getLocalIdentFn(isDev)
                                }
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    sourceMap: isDev,
                                }
                            }
                        )
                    },
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        include: [
                            resolveApp('./'),
                            /react-app-polyfill/
                        ],
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    presets: [
                                        ['@babel/preset-env', {
                                            'useBuiltIns': 'usage',
                                            'corejs': '3'
                                        }],
                                        '@babel/preset-react'
                                    ],
                                    plugins: [
                                        'react-hot-loader/babel',
                                        '@babel/plugin-proposal-class-properties'
                                    ]
                                },
                            }
                        ]
                    },
                    {
                        test: /\.(eot|ttf|woff2)$/,
                        use: {
                            loader: 'file-loader',
                            options: {  // 配置
                                outputPath: 'images/', // 输出到images文件夹下
                                regExp: /(\/src|\/node_modules)([^.]+)/,   // remove `src`|`node_modules` from path
                                name(file) {    // 以源文件名字及格式输出
                                    if (isDev) {
                                        return '[name].[ext]';
                                    }
                                    return '[name].[hash:8].[ext]';
                                }
                            }
                        }
                    },
                    {
                        test: /\.(svg|jpe?g|png|gif|ico)$/,
                        use: {
                            loader: 'url-loader',
                            options: { // 配置
                                outputPath: 'images/', // 输出到images文件夹下
                                regExp: /(\/src|\/node_modules)([^.]+)/,
                                name(file) {    // 以源文件名字及格式输出
                                    if (isDev) {
                                        return '[name].[ext]';
                                    }
                                    return '[name].[hash:8].[ext]';
                                },
                                limit: 10240 // 超过10kb打包为图片
                            }
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        port: 3000
    },
    resolve: {
        extensions: ['.jsx', '.js'],
        alias: {

        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
}