import * as Bundler from 'parcel-bundler';
import {getSession} from './getSession';

export default class HelperAsset extends Bundler.Asset {

    public constructor(
        name: string,
        options: Bundler.IBundlerOptions,
    ) {
        super(name, options);
        this.type = 'esifycss';
    }

    public async generate() {
        const session = await getSession(this);
        const code = session.getHelperScript();
        return [
            {type: 'js', value: code},
        ];
    }

}

module.exports = HelperAsset;
