const
    path                = require('path'),
    passport            = require('passport'),
    router              = require('express').Router(),
    appConfig           = require(path.join(__dirname, '..', 'config', 'app.json')),
    helpers             = require(path.join(__dirname, '..', 'lib', 'helpers.js')),

    log                 = helpers.log,
    langs               = helpers.langs,
    gpath               = helpers.getPath,

    ArticleController   = require(path.join(__dirname, '..', 'controllers', 'ArticleController.js')),
    GalleryController   = require(path.join(__dirname, '..', 'controllers', 'GalleryController.js')),
    IndexController     = require(path.join(__dirname, '..', 'controllers', 'IndexController.js')),
    JobController       = require(path.join(__dirname, '..', 'controllers', 'JobController.js')),
    MediaController     = require(path.join(__dirname, '..', 'controllers', 'MediaController.js')),
    PassportController  = require(path.join(__dirname, '..', 'controllers', 'PassportController.js')),
    ProductController   = require(path.join(__dirname, '..', 'controllers', 'ProductController.js')),
    ProgramController   = require(path.join(__dirname, '..', 'controllers', 'ProgramController.js'));

require('../config/passport')(passport);
router.use((req, res, next) => {
    req.locale = 'en';
    const
        urlName = req.originalUrl.substr(1).split('/')[0],
        appName = appConfig.APPLICATION_NAME;
    log({ message: 'Access', value: req.originalUrl });
    Object.keys(langs).forEach(locale => {
        Object.keys(helpers.pageKeys(locale)).forEach(pageKey => {
            if (helpers.pageKeys(locale)[pageKey].path === urlName) {
                req.locale = locale;
                req.title = `${helpers.pageKeys(locale)[pageKey].label} - ${appName}`;
            }
        })
    });
    if (!req.cookies[appConfig.COOKIE_NAME]) res.cookie(appConfig.COOKIE_NAME, req.locale, { expire: new Date() + 604800000 });
    next();
});
Object.keys(langs).forEach(locale => {
    router.get(`/${locale}`, (req, res) => IndexController.locale(req, res));
    appConfig.STATIC_PAGES.forEach((pageKey, index) => {
        router.get(`/${gpath({ locale: locale, pageKey: pageKey })}`, (req, res) => {
            res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}${pageKey}`, {
                title:      req.title,
                active:     gpath({ locale: locale, pageKey: pageKey }),
                i18n:       helpers.makeI18n({ locale: locale, pageKey: pageKey }),
                pagespeed:  helpers.pagespeed,
                pageKey:    pageKey,
                locale:     locale
            });
        });
    });
    router.get(`/${gpath({ locale: locale, pageKey: 'index' })}`,               (req, res) => ArticleController.public.home(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'news' })}`,                (req, res) => ArticleController.public.all(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'news' })}/:urlName`,       (req, res) => ArticleController.public.one(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'programs' })}`,            (req, res) => ProgramController.public.all(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'programs' })}/:urlName`,   (req, res) => ProgramController.public.one(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'product-finder' })}`,      (req, res) => ProductController.public.finder(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'galleries' })}`,           (req, res) => GalleryController.public.all(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'galleries' })}/:id`,       (req, res) => GalleryController.public.one(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'jobs' })}`,                (req, res) => JobController.public.all(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'logout' })}`,              (req, res) => PassportController.logout(req, res));
    router.get(`/${gpath({ locale: locale, pageKey: 'login' })}`,               (req, res) => {
        res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}login`, {
            title:      req.title,
            active:     helpers.getPath({ locale: 'en', pageKey: 'login' }),
            i18n:       helpers.makeI18n({ locale: 'en', pageKey: 'login' }),
            pagespeed:  helpers.pagespeed
        });
    });
    router.post(`/${gpath({ locale: locale, pageKey: 'signup' })}`,             PassportController.signup(passport, locale));
    router.post(`/${gpath({ locale: locale, pageKey: 'login' })}`,              PassportController.login(passport, locale));
});
router.get('/mediaList',    (req, res) => MediaController.public.json(req, res));
module.exports = router;
