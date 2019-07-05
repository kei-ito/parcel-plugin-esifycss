const plugin = (bundler) => {
    bundler.addAssetType('css', require.resolve('./CSSAsset.js'));
    bundler.addAssetType('esifycss', require.resolve('./HelperAsset.js'));
};
module.exports = Object.assign(plugin, {default: plugin});
