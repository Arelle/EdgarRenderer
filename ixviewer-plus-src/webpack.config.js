const path = require(`path`);
const glob = require("glob");
const webpack = require(`webpack`);
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = (
  env = { copy: true, analyze: false },
  argv = { mode: `production` }
) => {
  return {
    mode: argv.mode,

    entry: { "ix-viewer": "./src/ts/index.ts" },

    plugins: [
      new HtmlWebpackPlugin({
        inject: `body`,
        xhtml: true,
        template: `./src/index.xhtml`,
        filename: `ix.xhtml`,
      }),

      new webpack.BannerPlugin({
        banner: `Created by staff of the U.S. Securities and Exchange Commission.\nData and content created by government employees within the scope of their employment\nare not subject to domestic copyright protection. 17 U.S.C. 105.`,
      }),

      new MiniCssExtractPlugin({
        filename: `styles.[contenthash].min.css`,
      }),

      env.copy
        ? new CopyPlugin({
            patterns: [{ from: "src/assets", to: "assets" }],
          })
        : false,

      new PurgeCSSPlugin({
        paths: glob.sync(`${path.join(__dirname, "./src")}/**/*`, {
          nodir: true,
        }),
      }),

      new ESLintPlugin({
        extensions: ["ts"],
      }),
      env.analyze ? new BundleAnalyzerPlugin() : false,

      argv.mode === `production` ? false : false,

      new webpack.DefinePlugin({
        PRODUCTION: env.copy ? false : true,
      }),
    ].filter(Boolean),

    output: {
      filename:
        argv.mode === `production`
          ? `[name].bundle.[contenthash].min.js`
          : `[name].bundle.js`,
      path: path.resolve(__dirname, `./dist`),
      clean: true,
    },

    module: {
      rules: [
        // load TS
        {
          test: /\.tsx?$/,
          loader: `ts-loader`,
          // resolve: {
          //   fullySpecified: false,
          // },
          options: {
            configFile: path.resolve(__dirname, `tsconfig.json`),
            transpileOnly: true,
          },
          exclude: [
            path.resolve(__dirname, `../node_modules`),
            argv.mode === `production`
              ? path.resolve(__dirname, `./src/ts/**/*.development.ts`)
              : null,
          ].filter(Boolean),
        },
        // load SCSS
        {
          test: /\.s[ac]ss$/i,
          use: [
            argv.mode === `production`
              ? MiniCssExtractPlugin.loader
              : `style-loader`,
            "css-loader",
            `sass-loader`,
          ],
        },
        // load html
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
            esModule: true,
          },
        },
        // load image(s)
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: `asset/resource`,
        },
        // load font(s)
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: `asset/resource`,
        },
      ],
    },

    resolve: {
      extensions: [`.ts`, `.js`, ".scss"],
      fallback: {
        fs: false,
        path: false,
        buffer: false,
        crypto: false,
      },
    },

    devtool: argv.mode === `production` ? `source-map` : `inline-source-map`,

    devServer: {
      compress: true,
      port: 3000,
      static: path.resolve(__dirname, `./dist`),
      hot: true,
      liveReload: argv.mode === `production` ? false : true,
      watchFiles:
        argv.mode === `production`
          ? []
          : [`./src/**/*.html`, `./src/**/*.scss`, `./src/**/*.ts`],
      client: {
        overlay: true,
        logging: `none`,
      },
    },

    optimization: {
      minimize: true,
      usedExports: true,
    },

    performance: {
      hints: argv.mode === `production` ? false : false,
    },
  };
};
