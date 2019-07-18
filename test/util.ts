import * as fs from 'fs';
import * as util from 'util';
import Bundler from 'parcel-bundler';
import $rimraf from 'rimraf';
import * as vm from 'vm';
import esifycssPlugin from '..';
const readFile = util.promisify(fs.readFile);

class Element {

    public readonly tagName: string;

    public readonly children: Array<Element>;

    public constructor(tagName: string) {
        this.tagName = tagName;
        this.children = [];
    }

    public appendChild(element: Element) {
        this.children.push(element);
    }

}

class CSSRule {

    public cssText: string;

    public constructor(cssText: string) {
        this.cssText = cssText;
    }

}

class StyleSheet {

    public cssRules: Array<CSSRule>;

    public constructor() {
        this.cssRules = [];
    }

    public insertRule(cssText: string, index: number = 0) {
        this.cssRules.splice(index, 0, new CSSRule(cssText));
    }

}

class StyleElement extends Element {

    public sheet: StyleSheet;

    public constructor() {
        super('style');
        this.sheet = new StyleSheet();
    }

}

export const isStyleElement = (
    element: Element,
): element is StyleElement => element.tagName === 'style';

export const walkElements = function* (
    element: Element,
): IterableIterator<Element> {
    yield element;
    for (const childElement of element.children) {
        yield* walkElements(childElement);
    }
};

class Document {

    public readonly head: Element;

    public readonly body: Element;

    public constructor() {
        this.head = new Element('head');
        this.body = new Element('body');
    }

    public createElement(tagName: string) {
        switch (tagName) {
        case 'style':
            return new StyleElement();
        default:
            return new Element(tagName);
        }
    }

    public* walkElements(): IterableIterator<Element> {
        yield* walkElements(this.head);
        yield* walkElements(this.body);
    }

    public get stylesheets(): Array<StyleSheet> {
        const result: Array<StyleSheet> = [];
        for (const element of this.walkElements()) {
            if (isStyleElement(element)) {
                result.push(element.sheet);
            }
        }
        return result;
    }

}

export interface ISandbox<TExports extends {}> {
    document: Document,
    exports: Partial<TExports>,
    window: ISandbox<TExports>,
}

export const createSandbox = <TExports extends {}>(): ISandbox<TExports> => {
    const sandbox: ISandbox<TExports> = {
        document: new Document(),
        exports: {},
        get window() {
            return sandbox;
        },
    };
    return sandbox;
};

export const build = async (
    {input, outDir}: {
        input: string,
        outDir: string,
    },
) => {
    const bundler = new Bundler(input, {
        outDir,
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
    if (shouldBeUndefined) {
        throw new Error(`Found unexpected script: ${shouldBeUndefined}`);
    }
    return jsFile;
};

export const buildAndRun = async <TSandbox extends {}>(
    params: {
        input: string,
        outDir: string,
    },
): Promise<ISandbox<TSandbox>> => {
    const jsFile = await build(params);
    const code = await readFile(jsFile, 'utf-8');
    const sandbox = createSandbox<TSandbox>();
    vm.runInNewContext(code, sandbox);
    return sandbox;
};

export const rimraf = (
    file: string,
): Promise<void> => new Promise((resolve, reject) => $rimraf(file, (error) => {
    if (error) {
        reject(error);
    } else {
        resolve();
    }
}));
