const setDictionary = require('./setDictionary.js');
const plugin = (bundler) => {
    bundler.addAssetType('css', require.resolve('./CSSAsset.js'));
    bundler.addAssetType('esifycss', require.resolve('./HelperAsset.js'));
    bundler.on('bundled', setDictionary);
};
module.exports = Object.assign(plugin, {default: plugin});
