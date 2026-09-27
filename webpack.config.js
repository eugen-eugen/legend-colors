const path = require("path");
const webpack = require("webpack");

/*
 * Bundles the jArchi scripts that depend on @eugen-eugen/archi-metamodel.
 * The require()d meta-model package and the local libs are inlined into the
 * dist/*.ajs artifacts, which are the files to run inside Archi/jArchi.
 */
module.exports = {
  mode: "production",
  entry: {
    MetaFormatting: "./formatting/MetaFormatting.ajs",
    CheckMetaModelCompliance: "./review/CheckMetaModelCompliance.ajs",
    SyncViewWithModel: "./review/SyncViewWithModel.ajs",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].ajs",
  },
  target: "web",
  optimization: {
    minimize: false,
  },
  module: {
    rules: [{ test: /\.ajs$/, type: "javascript/auto" }],
  },
  resolve: {
    extensions: [".js", ".ajs"],
    fullySpecified: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      global: "globalThis",
    }),
  ],
};
