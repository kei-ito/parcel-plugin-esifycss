const Bundler = require('parcel-bundler');
const getSession = require('./getSession');

class CSSAsset extends Bundler.Asset {

    constructor(name, pkg, options) {
        super(name, pkg, options);
        this.type = 'css';
    }

    async generate() {
        const session = await getSession(this);
        const {code} = await session.processCSS(this.name);
        return [
            {type: 'js', value: code},
        ];
    }

}

module.exports = CSSAsset;
