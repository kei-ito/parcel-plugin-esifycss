import * as path from 'path';
import cpy from 'cpy';
// import * as vm from 'vm';
import $rimraf from 'rimraf';
import Bundler from 'parcel-bundler';
import esifycssPlugin from '../../lib';
// import {createSandbox} from '../util';
import test from 'ava';

const rimraf = (
    file: string,
): Promise<void> => new Promise((resolve, reject) => $rimraf(file, (error) => {
    if (error) {
        reject(error);
    } else {
        resolve();
    }
}));

test.before(async () => {
    const source = path.join(__dirname, 'src-original');
    const dest = path.join(__dirname, 'src');
    await Promise.all([dest, path.join(__dirname, 'dist')].map(rimraf));
    await cpy(source, dest);
});

test('run', async (t) => {
    const input = path.join(__dirname, 'src/index.html');
    const bundler = new Bundler(input, {
        outDir: path.join(__dirname, 'dist'),
        watch: false,
        cache: false,
        hmr: false,
        logLevel: 3,
    });
    esifycssPlugin(bundler);
    await bundler.bundle();
    t.log(bundler.bundleHashes);
    t.is('g', 'g');
});
