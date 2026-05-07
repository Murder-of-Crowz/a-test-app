const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("version");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "better-sqlite3") {
    return { type: "empty" }
  }
  return context.resolveRequest(context, moduleName, platform)
};

module.exports = config;