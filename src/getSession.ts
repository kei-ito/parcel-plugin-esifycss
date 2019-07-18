import * as path from 'path';
import * as util from 'util';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as esifycss from 'esifycss';
import * as Bundler from 'parcel-bundler';
const writeFile = util.promisify(fs.writeFile);
const resolves: Array<(session: esifycss.Session) => void> = [];
const getURLSafeBase64Hash = (
    input: string,
): string => {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('base64').replace('+', '-').replace('/', '_').replace('=', '');
};
const getHelperPath = (
    configuredPath: string | undefined,
    inputPath: string,
): string => {
    const ext = configuredPath ? path.extname(configuredPath) : '.js';
    return path.join(__dirname, `esifycss-${getURLSafeBase64Hash(inputPath).slice(0, 8)}.css${ext}`);
};
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
            const helper = getHelperPath(config.helper, bundleContext.name);
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
