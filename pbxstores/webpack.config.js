const childProcess = require("child_process");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

const { version } = require("./package.json");

const getAppVersion = () => {
  const commitHash = childProcess
    .execSync("git rev-parse --short HEAD")
    .toString();

  return `v${version} - ${commitHash}`;
};

const mfeSharedConfig = {
  react: {
    eager: true,
    singleton: true,
  },
  "react-dom": {
    eager: true,
    singleton: true,
  },
};

module.exports = (env, argv) => ({
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.join(__dirname, "/public"),
    filename: "[name].[contenthash].js",
    clean: {
      keep: /coverage|storybook/,
    },
  },
  ...(argv.mode === "development" && {
    devServer: {
      hot: true,
      port: 5000,
      watchContentBase: true,
      contentBase: "./",
    },
  }),
  devtool: argv.mode === "production" ? "source-map" : "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      // chunks: ['example'],
      template: "./src/index.html",
    }),
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(getAppVersion().trim()),
    }),
    // new CopyPlugin({
    //   patterns: [path.resolve(__dirname, 'mockServiceWorker.js')],
    // }),

    new ModuleFederationPlugin({
      name: "parentMfe",
      filename: "remoteEntry.js",
      exposes: {
        // './Main': './src/index.js',
        // Components
        // './components': './src/components/index.js',
      },
      shared: mfeSharedConfig,
    }),
    new CompressionPlugin(),
  ],
});
