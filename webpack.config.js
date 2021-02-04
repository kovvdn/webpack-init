const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const OptimizeCSSAssetsWebpackplugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const ImageMinimizerWebpackPlugin = require("image-minimizer-webpack-plugin");

require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const setPlugins = prod => {
  const base = [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "src/tmpl/index.html"),
      filename: "index.html",
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
    }),
  ];

  if (prod) {
    base.push(
      new ImageMinimizerWebpackPlugin({
        minimizerOptions: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            [
              "svgo",
              {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                ],
              },
            ],
          ],
        },
      })
    );
  }
  return base;
};

const setOptimizations = prod => {
  const base = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (prod) {
    base.minimizer = [
      new OptimizeCSSAssetsWebpackplugin(),
      new TerserWebpackPlugin(), // js compressor
    ];
  }

  return base;
};

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./js/[name].bundle.js",
  },
  mode: isProd ? "production" : "development",
  devtool: isProd ? false : "source-map",
  optimization: setOptimizations(isProd),
  module: {
    rules: [
      // {
      //   test: /\.html$/i,
      //   loader: "html-loader", //use directly in .html file
      // },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images",
              publicPath: "../",
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
              publicPath: "../",
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  devServer: {
    port: 4200,
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    historyApiFallback: true,
    open: true,
  },
  plugins: setPlugins(isProd),
};
