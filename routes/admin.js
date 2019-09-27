const
    fs                  = require('fs'),
    path                = require('path'),
    appConfig           = require(path.join(__dirname, '..', 'config', 'app.json')),
    pre                 = appConfig.ADMIN_VIEWS_PREFIX,
    mongoose            = require('mongoose'),
    router              = require('express').Router(),
    upload              = require('multer')({ dest: appConfig.UPLOAD_FOLDER, size: 50000000 }),
    helpers             = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    log                 = helpers.log,
    langs               = helpers.langs,
    /*langs               = {
        hu:                 require(path.join(__dirname, '..', 'locales', 'hu.json')),
        en:                 require(path.join(__dirname, '..', 'locales', 'en.json')),
        cz:                 require(path.join(__dirname, '..', 'locales', 'cz.json'))
    },*/
    types               = [{
        path:               'products',
        model:              'Product'
    }, {
        path:               'news',
        model:              'Article'
    }, {
        path:               'media',
        model:              'Media'
    }, {
        path:               'programs',
        model:              'Program'
    }, {
        path:               'jobs',
        model:              'Job'
    }, {
        path:               'users',
        model:              'User'
    }, {
        path:               'galleries',
        model:              'Gallery'
    }],
    Product             = require('../models/Product.js'),
    Article             = require('../models/Article.js'),
    Image               = require('../models/Image.js'),
    Video               = require('../models/Video.js'),
    Media               = require('../models/Media.js'),
    Program             = require('../models/Program.js'),
    Job                 = require('../models/Job.js'),
    User                = require('../models/User.js'),
    Gallery             = require('../models/Gallery.js'),

    ArticleController   = require(path.join(__dirname, '..', 'controllers', 'ArticleController.js')),
    GalleryController   = require(path.join(__dirname, '..', 'controllers', 'GalleryController.js')),
    JobController       = require(path.join(__dirname, '..', 'controllers', 'JobController.js')),
    MediaController     = require(path.join(__dirname, '..', 'controllers', 'MediaController.js')),
    PassportController  = require(path.join(__dirname, '..', 'controllers', 'PassportController.js')),
    ProductController   = require(path.join(__dirname, '..', 'controllers', 'ProductController.js')),
    ProgramController   = require(path.join(__dirname, '..', 'controllers', 'ProgramController.js')),
    UserController      = require(path.join(__dirname, '..', 'controllers', 'UserController.js')),

    isLoggedIn          = (req, res, next) => next(), /*{
        if (req.isAuthenticated()) return next();
        res.redirect('/login');
    },*/
    parseMessage        = (req, res, next) => {
        req.message = null;
        if (req.session && req.session.message) {
            req.message = req.session.message;
            delete req.session.message;
        }
        next();
    };

router.use((req, res, next) => {
    log({ message: 'Admin access', value: req.originalUrl });
    next();
});
router.get('/', isLoggedIn, (req, res) => {
    Promise
        .all(types
            .map(type => type.model)
            .map(model => new Promise((resolve, reject) => {
                mongoose
                    .model(model)
                    .count({}, (err, count) => {
                        if (err) {
                            log({ type: 'error', message: 'Cannot get counts.', value: err });
                            resolve({ model: model, count: 'N/A' });
                        } else {
                            resolve({ model: model, count: count });
                        }
                    });
            })))
        .then(counts => {
            const modelCounts = {};
            counts.forEach(count => { modelCounts[count.model] = count.count; });
            res.render(pre + 'index', {
                cards: [{
                    title: 'Megtekintés...',
                    width: 4,
                    list: types.map(t => {
                        return { text: langs.hu.admin.modelNames[t.model], href: `/admin/${t.path}/`, chip: modelCounts[t.model], icon: 'search' };
                    })
                }, {
                    title: 'Hozzáadás...',
                    width: 4,
                    list: types.map(t => {
                        return { text: langs.hu.admin.modelNames[t.model], href: `/admin/${t.path}/add/`, chip: modelCounts[t.model], icon: 'add' };
                    })
                }]
            });
        });
});

/* List & Add & Edit GET */
/*types.forEach(type => {
    router.get(`/${type.path}`, [isLoggedIn, parseMessage], (req, res) => {
        mongoose
            .model(type.model)
            .find({})
            .sort({ createdAt: -1 })
            .exec((err, results) => {
                if (err) {
                    log({ type: 'error', message: err });
                    results = [];
                }
                results = results.map(r => results.length ? r.toObject() : r);
                if ('Article' === type.model) {
                    Promise
                        .all(results.map(result => new Promise((resolve, reject) => {
                            result.imageUrl = appConfig.ARTICLE_DEFAULT_IMAGE_URL;
                            if (!result.image) {
                                resolve(result);
                            } else {
                                Image.findById(result.image, (err, image) => {
                                    if (err) {
                                        log({ type: 'error', message: 'Cannot get image.', value: err });
                                        resolve(result);
                                    } else {
                                        result.imageUrl = image.filename;
                                        delete result.image;
                                        resolve(result);
                                    }
                                });
                            }
                        })))
                        .then((newResults) => {
                            res.render(pre + `${type.path}/index`, {
                                results: newResults
                            });
                        })
                        .catch((reasons) => {
                            res.render(pre + `${type.path}/index`, {
                                results: results
                            });
                        });
                } else if ('Media' === type.model) {
                    Promise
                        .all(results.map(result => new Promise((resolve, reject) => {
                            mongoose.model(result.type).findById(result.id, (err, media) => {
                                if (err) {
                                    log({ type: 'error', message: 'Cannot get media.', value: err });
                                    resolve({});
                                } else {
                                    result = media;
                                    resolve(result);
                                }
                            });
                        })))
                        .then(newResults => {
                            res.render(pre + `${type.path}/index`, {
                                message: req.message,
                                results: newResults
                            });
                        });
                } else if ('Gallery' === type.model) {
                    console.log(results);
                    res.render(pre + `${type.path}/index`, {
                        results: results.map(g => {
                            g.count = g.images.length;
                            return g;
                        })
                    });
                } else {
                    res.render(pre + `${type.path}/index`, {
                        results: results
                    });
                }
            });
    });
    /*if ('Gallery' !== type.model) {
        router.get(`/${type.path}/add`, isLoggedIn, (req, res) => {
            const options = {};
            new Promise(resolve => {
                if ('Product' === type.model) {
                    options.values = appConfig.PRODUCT;
                    options.i18n = langs.hu;
                    resolve(options);
                } else if ('Article' === type.model) {
                    Gallery.find({}, (galleryErr, galleries) => {
                        if (galleryErr) {
                            options.galleries = [];
                        } else {
                            options.galleries = galleries.map(g => {
                                return {
                                    _id: g._id,
                                    title: g.title.hu
                                };
                            });
                        }
                        resolve(options);
                    });
                } else {
                    resolve(options);
                }
            }).then(options => {
                res.render(pre + `${type.path}/add`, options);
            });
        });
    }*/
        /*router.get(`/${type.path}/edit/:id`, [isLoggedIn, parseMessage], (req, res) => {
            mongoose.model(type.model).findById(req.params.id, (err, result) => {
                const options = {};
                if (err) {
                    log({ type: 'error', message: `Cannot get ${type.model}`, value: err });
                    req.session.message = `Cannot get ${type.model}: ${err}`;
                    res.redirect(`/${type.path}`);
                }
                result = result.toObject();
                options.message = req.message;
                options.document = result;
                console.log(result);
                if ('Product' === type.model) {
                    options.values = appConfig.PRODUCT;
                    options.i18n = langs.hu;
                }
                if (result.image) {
                    Image.findById(result.image, (imageErr, image) => {
                        if (imageErr) log({ type: 'error', message: imageErr });
                        result.imageUrl = image.filename;
                        res.render(pre + `${type.path}/add`, options);
                    });
                } else if (result.images) {
                    Promise
                        .all(result.images.map(i => new Promise(resolve => {
                            Image.findById(i, (imageErr, image) => {
                                if (imageErr) {
                                    resolve(null);
                                } else {
                                    resolve(image);
                                }
                            });
                        })))
                        .then(images => {
                            images = images
                                .filter(i => i !== null)
                                .map(i => i.toObject())
                                .map(i => {
                                    i.caption = i.caption.hu;
                                    return i;
                                })
                                .sort((i1, i2) => i1.createdAt > i2.createdAt)
                            result.images = images;
                            res.render(pre + `${type.path}/add`, options);
                        });
                } else {
                    res.render(pre + `${type.path}/add`, options);
                }
            });
        });*/
    //}
//});
/* All GET */
router.get('/galleries',            [isLoggedIn, parseMessage],             (req, res) => GalleryController.admin.all(req, res));
router.get('/jobs',                 [isLoggedIn, parseMessage],             (req, res) => JobController.admin.all(req, res));
router.get('/media',                [isLoggedIn, parseMessage],             (req, res) => MediaController.admin.all(req, res));
router.get('/news',                 [isLoggedIn, parseMessage],             (req, res) => ArticleController.admin.all(req, res));
router.get('/products',             [isLoggedIn, parseMessage],             (req, res) => ProductController.admin.all(req, res));
router.get('/programs',             [isLoggedIn, parseMessage],             (req, res) => ProgramController.admin.all(req, res));
router.get('/users',                [isLoggedIn, parseMessage],             (req, res) => UserController.admin.all(req, res));

/* Add GET */
router.get('/galleries/add',        [isLoggedIn, parseMessage],             (req, res) => GalleryController.admin.addGet(req, res));
router.get('/jobs/add',             [isLoggedIn, parseMessage],             (req, res) => JobController.admin.addGet(req, res));
router.get('/media/add',            [isLoggedIn, parseMessage],             (req, res) => MediaController.admin.addGet(req, res));
router.get('/news/add',             [isLoggedIn, parseMessage],             (req, res) => ArticleController.admin.addGet(req, res));
router.get('/products/add',         [isLoggedIn, parseMessage],             (req, res) => ProductController.admin.addGet(req, res));
router.get('/programs/add',         [isLoggedIn, parseMessage],             (req, res) => ProgramController.admin.addGet(req, res));
router.get('/users/add',            [isLoggedIn, parseMessage],             (req, res) => UserController.admin.addGet(req, res));

/* Add POST */
router.post('/galleries/add',       [isLoggedIn, parseMessage],             (req, res) => GalleryController.admin.addPost(req, res));
router.post('/jobs/add',            [isLoggedIn, parseMessage],             (req, res) => JobController.admin.addPost(req, res));
router.post('/media/add',           [isLoggedIn, parseMessage, upload.array('media')],  (req, res) => MediaController.admin.addPost(req, res));
router.post('/news/add',            [isLoggedIn, parseMessage],             (req, res) => ArticleController.admin.addPost(req, res));
router.post('/products/add',        [isLoggedIn, parseMessage, upload.single('pdfUrl')],    (req, res) => ProductController.admin.addPost(req, res));
router.post('/programs/add',        [isLoggedIn, parseMessage],             (req, res) => ProgramController.admin.addPost(req, res));
router.post('/users/add',           [isLoggedIn, parseMessage],             (req, res) => UserController.admin.addPost(req, res));

/* Edit GET */
router.get('/galleries/edit/:id',  [isLoggedIn, parseMessage],             (req, res) => GalleryController.admin.editGet(req, res));
router.get('/jobs/edit/:id',       [isLoggedIn, parseMessage],             (req, res) => JobController.admin.editGet(req, res));
router.get('/media/edit/:id',      [isLoggedIn, parseMessage, upload.single('media')],  (req, res) => MediaController.admin.editGet(req, res));
router.get('/news/edit/:id',       [isLoggedIn, parseMessage],             (req, res) => ArticleController.admin.editGet(req, res));
router.get('/products/edit/:id',   [isLoggedIn, parseMessage, upload.single('pdfUrl')], (req, res) => ProductController.admin.editGet(req, res));
router.get('/programs/edit/:id',   [isLoggedIn, parseMessage],             (req, res) => ProgramController.admin.editGet(req, res));
router.get('/users/edit/:id',      [isLoggedIn, parseMessage],             (req, res) => UserController.admin.editGet(req, res));

/* Edit POST */
router.post('/galleries/edit/:id',  isLoggedIn,                             (req, res) => GalleryController.admin.editPost(req, res));
router.post('/jobs/edit/:id',       isLoggedIn,                             (req, res) => JobController.admin.editPost(req, res));
router.post('/media/edit/:id',      [isLoggedIn, parseMessage, upload.single('media')],   (req, res) => MediaController.admin.editPost(req, res));
router.post('/news/edit/:id',       isLoggedIn,                             (req, res) => ArticleController.admin.editPost(req, res));
router.post('/products/edit/:id',   [isLoggedIn, upload.single('pdfUrl')],  (req, res) => ProductController.admin.editPost(req, res));
router.post('/programs/edit/:id',   isLoggedIn,                             (req, res) => ProgramController.admin.editPost(req, res));
router.post('/users/edit/:id',      isLoggedIn,                             (req, res) => UserController.admin.editPost(req, res));

/* Delete GET */
router.get('/galleries/delete/:id', [isLoggedIn, parseMessage],             (req, res) => GalleryController.admin.deleteGet(req, res));
router.get('/jobs/delete/:id',      [isLoggedIn, parseMessage],             (req, res) => JobController.admin.deleteGet(req, res));
router.get('/media/delete/:id',     [isLoggedIn, upload.single('media')],   (req, res) => MediaController.admin.deleteGet(req, res));
router.get('/news/delete/:id',      [isLoggedIn, parseMessage],             (req, res) => ArticleController.admin.deleteGet(req, res));
router.get('/products/delete/:id',  [isLoggedIn, parseMessage],             (req, res) => ProductController.admin.deleteGet(req, res));
router.get('/programs/delete/:id',  [isLoggedIn, parseMessage],             (req, res) => ProgramController.admin.deleteGet(req, res));
router.get('/users/delete/:id',     [isLoggedIn, parseMessage],             (req, res) => UserController.admin.deleteGet(req, res));

module.exports = router;