const Bundler = require('parcel-bundler');
const getSession = require('./getSession');

class HelperAsset extends Bundler.Asset {

    constructor(name, pkg, options) {
        super(name, pkg, options);
        this.type = 'esifycss';
    }

    async generate() {
        const session = await getSession(this);
        const code = session.getHelperScript();
        return [
            {type: 'js', value: code},
        ];
    }

}

module.exports = HelperAsset;
