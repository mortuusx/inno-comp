const
    path = require('path'),
    url = require('url'),
    appConfig = require(path.join(__dirname, '..', 'config', 'app.json')),
    helpers = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Model = require(path.join(__dirname, '..', 'models', 'Article.js')),
    controller = {};

controller.locale = (req, res) => {
    const locale = req.url.replace(/\//g, '');
    //const reqlocale = req.locale
    let redirectPageKey = 'index';
    new Promise(resolve => {
        if (req.headers.referer) {
            const ref = url.parse(req.headers.referer);
            const p = ref.pathname.split('/');
            ['en', 'cz', 'hu', 'de'].forEach(lang => {
                const pageKeys = helpers.pageKeys(lang);
                Object.keys(pageKeys).forEach(pageKey => {
                    //if (pageKeys[pageKey].path === ref.pathname.replace(/\//g, '')) redirectPageKey = pageKey;
                    if (pageKeys[pageKey].path === p[1]) redirectPageKey = pageKey;
                });
            });
            //console.debug(`redirect page ${redirectPageKey}, p ${JSON.stringify(p)}, locale: ${reqlocale}, locale2: ${locale}`)
            if (redirectPageKey == 'news' && p[2]) {
                Model.findOne({
                    $or: [{
                        'urlName.hu': p[2]
                    }, {
                        'urlName.cz': p[2]
                    }, {
                        'urlName.en': p[2]
                    }, {
                        'urlName.de': p[2]
                    }]
                }).exec((resultErr, result) => {
                    //console.debug(`news suburl: ${JSON.stringify(result)}`)
                    resolve(result && result.urlName[locale]);
                });
            } else {
                resolve(null);
            }
        }
    }).then(suburl => {
        res.cookie(appConfig.COOKIE_NAME, locale, {
            expire: new Date() + 604800000
        }).redirect(`/${helpers.getPath({ locale: locale, pageKey: redirectPageKey })}${suburl ? '/' + suburl : '' }`);
    });
};

module.exports = controller;