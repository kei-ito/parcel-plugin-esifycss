import Bundler from 'parcel-bundler';
import {setDictionary} from './setDictionary';

export const plugin = (
    bundler: Bundler,
) => {
    bundler.addAssetType('css', require.resolve('./CSSAsset'));
    bundler.addAssetType('esifycss', require.resolve('./HelperAsset'));
    bundler.on('bundled', setDictionary);
};
