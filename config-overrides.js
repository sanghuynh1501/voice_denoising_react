const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = function override(config, env) {
  config.plugins.push(new AddAssetHtmlPlugin({ filepath: require.resolve('./wasmjs/init_go.js') }))
  config.plugins.push(new AddAssetHtmlPlugin({ filepath: require.resolve('./wasmjs/wasm_exec.js') }))
  return config
}