const {
  override,
  addBabelPlugins,
} = require("customize-cra");

const path = require("path");

const customBabelPlugins = () => {
  return [
    ["import", { libraryName: "antd", libraryDirectory: "es", style: "css" }],
    process.env.NODE_ENV === "development" && ["babel-plugin-styled-components", { displayName: true }],
  ].filter(plugin => plugin);
};

module.exports = {
  webpack: override(
    ...addBabelPlugins(
      ...customBabelPlugins(),
    ),
      (config) => {
        config.resolve = {
          ...config.resolve,
          alias: { "@": path.resolve(__dirname, "src") },
        };

        return config;
      },
    ),
};
