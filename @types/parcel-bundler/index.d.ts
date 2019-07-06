import * as EventEmitter from 'events';

export interface IBundlerOptions {
    outDir: string,
    watch: boolean,
    cache: boolean,
    hmr: boolean,
    logLevel: 0 | 1 | 2 | 3,
}

/**
 * https://github.com/parcel-bundler/parcel/blob/master/packages/core/parcel-bundler/src/Asset.js
 */
export class Asset {

    public type: string;

    public name: string;

    public constructor(name: string, options: IBundlerOptions)

    public getConfig<TConfig = {[key: string]: any}>(filenames: Array<string>, opts?: {}): Promise<TConfig>

}

export class Bundle {

    public type: string;

    public name: string;

    public childBundles: Set<Bundle>;

}

declare class Bundler extends EventEmitter {

    public bundleHashes: Map<string, string>;

    public constructor(input: string, options: IBundlerOptions)

    public addAssetType(extension: string, path: string): void

    public bundle(): Promise<void>

}

export default Bundler;
