import * as path from 'path';
import cpy from 'cpy';
import * as fs from 'fs';
import * as util from 'util';
import * as vm from 'vm';
import * as esifycss from 'esifycss';
import $rimraf from 'rimraf';
import Bundler from 'parcel-bundler';
import esifycssPlugin from '../..';
import {createSandbox} from '../util';
import test from 'ava';

const readFile = util.promisify(fs.readFile);
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
    const [jsFile, shouldBeUndefined] = [...bundler.bundleHashes]
    .map(([name]) => name)
    .filter((name) => name.endsWith('.js'));
    t.is(typeof shouldBeUndefined, 'undefined');
    const code = await readFile(jsFile, 'utf-8');
    const sandbox = createSandbox<{
        css1: esifycss.IEsifyCSSResult,
        css2: esifycss.IEsifyCSSResult,
        foo: {foo1: string, foo2: string},
    }>();
    vm.runInNewContext(code, sandbox);
    const {exports: {css1, css2, foo}} = sandbox;
    if (css1 && css2 && foo) {
        const identifiers = [
            ...Object.entries(css1.className).map(([, value]) => value),
            ...Object.entries(css1.id).map(([, value]) => value),
            ...Object.entries(css1.keyframes).map(([, value]) => value),
            ...Object.entries(css2.className).map(([, value]) => value),
            ...Object.entries(css2.id).map(([, value]) => value),
            ...Object.entries(css2.keyframes).map(([, value]) => value),
        ];
        t.true(identifiers.every((identifier) => typeof identifier === 'string'));
        t.is(identifiers.length, new Set(identifiers).size);
        t.is(typeof css1.className.container, 'string');
        t.is(typeof css1.id.foo, 'string');
        t.is(typeof css1.keyframes.aaa, 'string');
        t.is(typeof css2.className.container, 'string');
        t.is(typeof css2.id.foo, 'string');
        t.is(typeof css2.keyframes.aaa, 'string');
        t.is(foo.foo1, 'foo1');
        t.is(foo.foo2, 'foo2');
    } else {
        t.truthy(css1);
        t.truthy(css2);
        t.truthy(foo);
    }
});
