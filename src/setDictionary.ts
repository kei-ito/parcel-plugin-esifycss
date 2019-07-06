import * as fs from 'fs';
import * as util from 'util';
import * as esifycss from 'esifycss';
import * as Bundler from 'parcel-bundler';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const walkBundles = function* (
    bundle: Bundler.Bundle,
): IterableIterator<Bundler.Bundle> {
    yield bundle;
    for (const childBundle of bundle.childBundles) {
        yield* walkBundles(childBundle);
    }
};

const getBundles = (
    rootBundle: Bundler.Bundle,
): Set<Bundler.Bundle> => {
    const bundles = new Set<Bundler.Bundle>();
    for (const bundle of walkBundles(rootBundle)) {
        bundles.add(bundle);
    }
    return bundles;
};

export const setDictionary = (
    rootBundle: Bundler.Bundle,
) => Promise.all([...getBundles(rootBundle)].map(async (bundle) => {
    if (bundle.type === 'js') {
        let code = await readFile(bundle.name, 'utf8');
        const cssRanges = esifycss.extractCSSFromScript(code);
        const tokens = new Map();
        for (const rule of cssRanges) {
            for (const token of esifycss.tokenizeString(rule.css)) {
                tokens.set(token, (tokens.get(token) || 0) + 1);
            }
        }
        const identifier = esifycss.createOptimizedIdentifier(tokens);
        code = esifycss.minifyCSSInScript(code, cssRanges, identifier);
        code = esifycss.setDictionary(code, identifier.idList);
        await writeFile(bundle.name, code);
    }
}));
