import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as esifycss from 'esifycss';
import * as Bundler from 'parcel-bundler';
const writeFile = util.promisify(fs.writeFile);
const resolves = [];
/**
 * @type Promise<void> | undefined
 */
let loading: Promise<void> | undefined;
/**
 * @type esifycss.Session | undefined
 */
let session: esifycss.Session | undefined;
/**
 * @param {esifycss.ISessionOptions | undefined} config
 * @returns {Promise<esifycss.Session>}
 */
export const getSession = (
    bundleContext: Bundler.Asset,
): Promise<esifycss.Session> => {
    if (session) {
        return Promise.resolve(session);
    }
    if (!loading && bundleContext) {
        const patterns = ['.esifycssrc', 'esifycss.config.js', 'package.json'];
        loading = bundleContext.getConfig<esifycss.ISessionOptions>(patterns)
        .then(async (config) => {
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
