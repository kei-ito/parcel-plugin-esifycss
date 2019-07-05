const path = require('path');
const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);
const resolves = [];
const esifycss = require('esifycss');
/**
 * @type Promise<void> | undefined
 */
let loading;
/**
 * @type esifycss.Session | undefined
 */
let session;
/**
 * @param {esifycss.ISessionOptions | undefined} config
 * @returns {Promise<esifycss.Session>}
 */
const getSession = (bundleContext) => {
    if (session) {
        return session;
    }
    if (!loading && bundleContext) {
        const patterns = ['.esifycssrc', 'esifycss.config.js', 'package.json'];
        loading = bundleContext.getConfig(patterns).then(async (config) => {
            const ext = config.helper ? path.extname(config.helper) : '.js';
            const helper = path.join(__dirname, `esifycss.css${ext}`);
            session = new esifycss.Session({...config, helper});
            await writeFile(helper, await session.getHelperScript());
            for (const resolve of resolves) {
                resolve(session);
            }
        });
    }
    return new Promise((resolve) => {
        resolves.push(resolve);
    });
};

module.exports = getSession;
