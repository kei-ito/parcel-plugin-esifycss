const walkBundles = function* (bundle) {
    yield bundle;
    for (const childBundle of bundle.childBundles) {
        yield* walkBundles(childBundle);
    }
};

const getBundles = (rootBundle) => {
    const bundles = new Set();
    for (const bundle of walkBundles(rootBundle)) {
        bundles.add(bundle);
    }
    return bundles;
};

const fs = require('fs');
const util = require('util');
const esifycss = require('esifycss');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = (rootBundle) => {
    Promise.all([...getBundles(rootBundle)].map(async (bundle) => {
        if (bundle.type === 'js') {
            let code = await readFile(bundle.name);
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
};
