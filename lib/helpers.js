const
    fs          = require('fs')
    path        = require('path'),
    bcrypt      = require('bcrypt-nodejs'),
    appConfig   = require(path.join(__dirname, '..', 'config', 'app.json')),
    langs       = {
        hu: {},
        en: {},
        cz: {},
        de: {}
    },
    pageKeys    = (locale) => {
        const menu = {};
        Object.keys(langs[locale].menu).forEach(menuKey => {
            Object.keys(langs[locale].menu[menuKey]).forEach(pageKey => {
                menu[pageKey] = langs[locale].menu[menuKey][pageKey];
            });
        });
        return menu;
    },
    pagespeed   = {
        style:      fs.readFileSync(path.join(__dirname, '..', 'public', 'public-assets', 'css', 'fold.css'), 'utf-8').replace(/\"/g, '\'').replace(/url\(\'\.\.\/img\//g, 'url(\'/assets/img/'),
        script:     fs.readFileSync(path.join(__dirname, '..', 'public', 'public-assets', 'js', 'scripts.js'), 'utf-8')
    },
    log = options => console[options.type || 'log'](`[${new Date().toISOString()}]${'error' === options.type ? ' [ERROR]' : ''} ${options.message}${options.elapsed ? ' [' + options.elapsed + 'ms]' : ''}${options.value ? ': ' + options.value : ''}`),
    getPath = options => pageKeys(options.locale)[options.pageKey] ? pageKeys(options.locale)[options.pageKey].path : false,
    makeI18n = options => {
        const
            i18n = {},
            l = options.locale,
            k = options.pageKey;
        if (langs[l] && langs[l].menu) i18n.menu = langs[l].menu;
        if (langs[l] && langs[l].footer) i18n.footer = langs[l].footer;
        if (langs[l] && langs[l][k]) {
            Object.keys(langs[l][k]).forEach(key => {
                i18n[key] = langs[l][k][key];
            });
        }
        if (langs[l] && langs[l].global) {
            Object.keys(langs[l].global).forEach(key => {
                if (i18n[key]) i18n[`global-${key}`] = langs[l].global[key];
                i18n[key] = langs[l].global[key];
            });
        }
        return i18n;
    },
    pagespeed = {
        style: fs.readFileSync(path.join(__dirname, '..', 'public', 'public-assets', 'css', 'fold.css'), 'utf-8').replace(/\"/g, '\'').replace(/url\(\'\.\.\/img\//g, 'url(\'/assets/img/'),
        script: fs.readFileSync(path.join(__dirname, '..', 'public', 'public-assets', 'js', 'scripts.js'), 'utf-8')
    };
Object.keys(langs).forEach(locale => {
    ['global', 'menu', 'index', 'about', 'products', 'contact', 'certificates', 'programs', 'jobs', 'news', 'footer', 'product-finder'].forEach(pageKey => {
        langs[locale][pageKey] = require(path.join(__dirname, '..', 'locales', locale, `${pageKey}.json`));
    });
});
langs.hu.admin = require(path.join(__dirname, '..', 'locales', 'hu', 'admin.json'));
module.exports = {
    langs: langs,
    urlNamify: text =>
        text
            .toLowerCase()
            .replace(/[áàâãåā]/g, 'a')
            .replace(/[éèêëęėē]/g, 'e')
            .replace(/[íîïìįī]/g, 'i')
            .replace(/[óőôòõoøō]/g, 'o')
            .replace(/[úűûùū]/g, 'u')
            .replace(/[äæ]/g, 'ae')
            .replace(/[öœ]/g, 'oe')
            .replace(/[ü]/g, 'ue')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/--+/g, '-')
            .replace(/-$/g, '')
            .replace(/^-/g, ''),
    generateFilename: name =>
        `${Math.round((Math.pow(20, length + 1) - Math.random() * Math.pow(20, length))).toString(20).slice(1)}${name.split('.')[name.split('.').length - 1]}`,
    log: log,
    copy: (source, target) => new Promise((resolve, reject) => {
        const
            rejectCleanup = (err) => {
                rd.destroy();
                wr.end();
                reject(err);
            },
            rd = fs.createReadStream(source),
            wr = fs.createWriteStream(target);
        rd.on('error', rejectCleanup);
        wr.on('error', rejectCleanup);
        wr.on('finish', () => {
            resolve();
        });
        rd.pipe(wr);
    }),
    checkAndCreate: destination => new Promise((resolve, reject) => {
        fs.access(destination, fs.constants.R_OK | fs.constants.W_OK, accessErr => {
            if (accessErr) {
                fs.mkdir(destination, 0744, mkdirErr => {
                    if (mkdirErr) reject(mkdirErr);
                    resolve();
                });
            }
            resolve();
        });
    }),
    pageKeys: (locale) => pageKeys(locale),
    getPath: getPath,
    renderPath: (opts) => {
        //let p = `${opts.admin ? appConfig.ADMIN_VIEWS_PREFIX : appConfig.PUBLIC_VIEWS_PREFIX}${opts.path !== 'index' }`;
        if (opts.admin) {
            p = `${appConfig.ADMIN_VIEWS_PREFIX}${opts.path}/`;
            if (opts.path !== 'index') {
                if (opts.single) {
                    p += 'single';
                } else {
                    p += 'index';
                }
            }
        } else {
            p = `${appConfig.PUBLIC_VIEWS_PREFIX}${opts.path}/`;
            if (['galleries', 'news', 'programs'].indexOf(opts.path) > -1) {
                if (opts.single) {
                    p += 'single';
                } else {
                    p += 'index';
                }
            }
        }
        return p;
    },
    makeI18n: makeI18n,
    messages: {
        ARTICLE: {
            SAVED: 'A cikk felvétele sikeres volt',
            UPDATED: 'A cikk módosítása sikeres volt',
            DELETED: 'A cikk törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A cikk felvétele során hiba történt',
            UPDATE_ERR: 'A cikk módosítása során hiba történt',
            DELETE_ERR: 'A cikk törlése során hiba történt'
        },
        GALLERY: {
            SAVED: 'A galéria felvétele sikeres volt',
            UPDATED: 'A galéria módosítása sikeres volt',
            DELETED: 'A galéria törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A galéria felvétele során hiba történt',
            UPDATE_ERR: 'A galéria módosítása során hiba történt',
            DELETE_ERR: 'A galéria törlése során hiba történt'
        },
        IMAGE: {
            SAVED: 'A kép(ek) felvétele sikeres volt',
            UPDATED: 'A kép(ek) módosítása sikeres volt',
            DELETED: 'A kép(ek) törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A kép(ek) felvétele során hiba történt',
            INVALID_TYPE_ERR: 'Nem megfelelő fájlformátum',
            UPDATE_ERR: 'A kép(ek) módosítása során hiba történt',
            DELETE_ERR: 'A kép(ek) törlése során hiba történt'
        },
        JOB: {
            SAVED: 'Az állásajánlat felvétele sikeres volt',
            UPDATED: 'Az állásajánlat módosítása sikeres volt',
            DELETED: 'Az állásajánlat törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'Az állásajánlat felvétele során hiba történt',
            UPDATE_ERR: 'Az állásajánlat módosítása során hiba történt',
            DELETE_ERR: 'Az állásajánlat törlése során hiba történt'
        },
        PRODUCT: {
            SAVED: 'A termék felvétele sikeres volt',
            UPDATED: 'A termék módosítása sikeres volt',
            DELETED: 'A termék törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A termék felvétele során hiba történt',
            INVALID_TYPE_ERR: 'Nem megfelelő fájlformátum',
            UPDATE_ERR: 'A termék módosítása során hiba történt',
            DELETE_ERR: 'A termék törlése során hiba történt'
        },
        PROGRAM: {
            SAVED: 'A program felvétele sikeres volt',
            UPDATED: 'A program módosítása sikeres volt',
            DELETED: 'A program törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A program felvétele során hiba történt',
            UPDATE_ERR: 'A program módosítása során hiba történt',
            DELETE_ERR: 'A program törlése során hiba történt'
        },
        USER: {
            SAVED: 'A felhasználó felvétele sikeres volt',
            UPDATED: 'A felhasználó módosítása sikeres volt',
            DELETED: 'A felhasználó törlése sikeres volt',
            GET_ERR: '',
            SAVE_ERR: 'A felhasználó felvétele során hiba történt',
            UPDATE_ERR: 'A felhasználó módosítása során hiba történt',
            DELETE_ERR: 'A felhasználó törlése során hiba történt'
        }
    },
    adminAll: (req, res, ctlr, pathName) => {
        ctlr.getAllRaw(req, res).then(results => {
            if (!results) return res.redirect('/admin');
            res.render(`${appConfig.ADMIN_VIEWS_PREFIX}${pathName}/index`, {
                results: results
            });
        })
    },
    publicOne: (req, res, ctlr, renderPath, pageKey) => {
        ctlr.getOne(req, res).then(result => {
            if (!result) return res.redirect('/404');
            res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}${renderPath}/single`, {
                title:      req.title,
                active:     getPath({ locale: req.locale, pageKey: pageKey }),
                i18n:       makeI18n({ locale: req.locale, pageKey: pageKey }),
                pagespeed:  pagespeed,
                document:   result,
                locale:     req.locale
            });
        });
    },
    publicAll: (req, res, ctlr, renderPath, pageKey) => {
        ctlr.getAll(req, res).then(results => {
            if (!results) return res.redirect('/404');
            res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}${renderPath}`, {
                title:      req.title,
                active:     getPath({ locale: req.locale, pageKey: pageKey }),
                i18n:       makeI18n({ locale: req.locale, pageKey: pageKey }),
                pagespeed:  pagespeed,
                results:    results,
                locale:     req.locale
            });
        });
    },
    addGet: (res, pathName, opts) => {
        return res.render(`${appConfig.ADMIN_VIEWS_PREFIX}${pathName}/add`, opts);
    },
    addPost: (req, res, Model, obj, messages, pathName, property) => {
        new Model(obj)
            .save()
            .then(result => {
                log({ message: messages.SAVED, value: result });
                req.session.message = `${messages.SAVED}: ${result[property].hu ? result[property].hu : result[property]}`;
                res.redirect(`/admin/${pathName}/edit/${result._id}`);
            }, reason => {
                log({ type: 'error', message: messages.SAVE_ERR, value: reason });
                req.session.message = `${messages.SAVE_ERR}: ${reason}`;
                res.redirect(`/admin/${pathName}`);
            });
    },
    editGet: (req, res, ctlr, pathName, opts) => {
        ctlr.getOneRaw(req, res).then(result => {
            const subPath = 'media' === pathName ? 'edit' : 'add';
            opts = opts || {};
            if (!result) return res.redirect(`/admin/${pathName}`);
            opts.document = result;

            res.render(`${appConfig.ADMIN_VIEWS_PREFIX}${pathName}/${subPath}`, opts);
        });
    },
    editPost: (req, res, Model, obj, messages, pathName, property) => {
        Model.findOneAndUpdate({ _id: req.body.id }, obj, { upsert: true }, (updateErr, result) => {
            if (updateErr || !result) {
                log({ message: messages.UPDATE_ERR, value: updateErr ? updateErr : null });
                req.session.message = `${messages.UPDATE_ERR}: ${result[property].hu ? result[property].hu : result[property]}`;
                return res.redirect(`/admin/${pathName}/edit/${result._id}`);
            }
            log({ message: messages.UPDATED, value: result });
            req.session.message = `${messages.UPDATED}: ${result[property].hu ? result[property].hu : result[property]}`;
            res.redirect(`/admin/${pathName}/edit/${result._id}`);
        });
    },
    deleteGet: (req, res, Model, messages, pathName, property) => {
        Model.findOneAndRemove({ _id: req.params.id }, (deleteErr, result) => {
            if (deleteErr || !result) {
                log({ message: messages.DELETE_ERR, value: deleteErr ? deleteErr : null });
                if (result && result[property]) {
                    req.session.message = `${messages.DELETE_ERR}: ${result[property].hu ? result[property].hu : result[property]}`;
                }
                return res.redirect(`/admin/${pathName}/`);
            }
            log({ message: messages.DELETED, value: result });
            if (result && result[property]) {
                req.session.message = `${messages.DELETED}: ${result[property].hu ? result[property].hu : result[property]}`;
            }
            res.redirect(`/admin/${pathName}/`);
        });
    },
    pagespeed: pagespeed
};