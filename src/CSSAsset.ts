import * as Bundler from 'parcel-bundler';
import {getSession} from './getSession';

class CSSAsset extends Bundler.Asset {

    public constructor(
        name: string,
        options: Bundler.IBundlerOptions,
    ) {
        super(name, options);
        this.type = 'css';
    }

    public async generate() {
        const session = await getSession(this);
        const {code} = await session.processCSS(this.name);
        return [
            {type: 'js', value: code},
        ];
    }

}

module.exports = CSSAsset;
