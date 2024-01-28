const path = require(`path`);
const glob = require("glob");
const webpack = require(`webpack`);
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ESLintPlugin = require("eslint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (
  env = { copy: true, analyze: false },
  argv = { mode: `production` }
) => {
  const forProd = argv.mode === `production`;
  const forWorkstation = argv.env.domain === 'workstation';
  return {
    mode: argv.mode,

    entry: { "ix-viewer": "./src/ts/index.ts" },

    plugins: [
      new HtmlWebpackPlugin({
        inject: `body`,
        minify: false,
        xhtml: true,
        useShortDoctype: false,
        showErrors: true,
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

      forProd ? false : false,

      new webpack.DefinePlugin({
        PRODUCTION: env.copy ? false : true,
      }),

      new CleanWebpackPlugin(),
    ].filter(Boolean),

    output: {
      filename:
        forProd
          ? `[name].bundle.[contenthash].min.js`
          : `[name].bundle.js`,
      publicPath: 
        forWorkstation
        ? '/AR/ixviewer-plus/' 
        : forProd 
          ? '/ixviewer-plus/' : undefined, 
          // undefined for dev && !ws (served from memory)
        // forProd
        //   ? forWorkstation
        //     ? '/AR/ixviewer-plus/' : '/ixviewer-plus/'
        //   : forWorkstation
        //     ? '/AR/ixviewer-plus/' : undefined,
      path: forWorkstation
        ? path.resolve(__dirname, `./dist-ws`)
        : path.resolve(__dirname, `./dist`)
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
            forProd
              ? path.resolve(__dirname, `./src/ts/**/*.development.ts`)
              : null,
          ].filter(Boolean),
        },
        // load SCSS
        {
          test: /\.s[ac]ss$/i,
          use: [
            forProd
              ? MiniCssExtractPlugin.loader
              : MiniCssExtractPlugin.loader,
              // : `style-loader`,
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

    devtool: forProd ? `source-map` : `inline-source-map`,

    devServer: {
      compress: true,
      port: 3000,

      static: forWorkstation // static means stuff "not served from webpack".  Not sure it's even used.
        ? path.resolve(__dirname, `./dist-ws`)
        : path.resolve(__dirname, `./dist`),
      hot: true,
      liveReload: forProd ? false : true,
      watchFiles:
        forProd
          ? []
          : [`./src/**/*.html`, `./src/**/*.scss`, `./src/**/*.ts`],
      client: {
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: true,
        },
        logging: `none`,
        progress: true,
      },
    },

    optimization: {
      minimize: forProd ? true : false,
      usedExports: true,
    },

    performance: {
      hints: forProd ? false : false,
    },
  };
};
