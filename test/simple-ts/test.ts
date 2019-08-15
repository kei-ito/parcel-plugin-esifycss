import * as path from 'path';
import * as esifycss from 'esifycss';
import test from 'ava';
import cpy from 'cpy';
import {buildAndRun, rimraf} from '../util';

test.before(async () => {
    const source = path.join(__dirname, 'src-original');
    const dest = path.join(__dirname, 'src');
    await Promise.all([dest, path.join(__dirname, 'dist')].map(rimraf));
    await cpy(source, dest);
});

test('run', async (t) => {
    const {exports: {css1, css2, foo}} = await buildAndRun<{
        css1: esifycss.IEsifyCSSResult,
        css2: esifycss.IEsifyCSSResult,
        foo: {foo1: string, foo2: string},
    }>({
        input: path.join(__dirname, 'src/index.html'),
        outDir: path.join(__dirname, 'dist'),
    });
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
