const
    fs                  = require('fs'),
    path                = require('path'),
    Model               = require(path.join(__dirname, '..', 'models', 'Article.js')),
    GalleryController   = require(path.join(__dirname, '..', 'controllers', 'GalleryController.js')),
    helpers             = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    messages            = helpers.messages.ARTICLE,
    controller          = {
        admin:              {},
        public:             {}
    },
    i18nProps           = ['title', 'content'],
    pathName            = 'news',
    property            = 'title',
    obj                 = (req) => {
        const obj = {};
        i18nProps.forEach(field => {
            obj[field] = {};
            ['en', 'hu', 'cz', 'de'].forEach(locale => obj[field][locale] = req.body[`${field}-${locale}`]);
        });
        obj.published = req.body.published ? true : false;
        if (req.body.images) obj.image = req.body.images && JSON.parse(req.body.images).length ? JSON.parse(req.body.images)[0] : '';
        if (req.body.gallery) obj.gallery = req.body.gallery;
        return obj;
    };
controller.getOneRaw = (req, res) => new Promise(resolve => {
    Model.findById(req.params.id, (resultErr, result) => {
        if (resultErr || !result) resolve(false);
        Model.populate(result, [{ path: 'image' }, { path: 'gallery', populate: [{ path: 'images' }, { path: 'cover' }] }], (populateErr, result) => {
            if (populateErr || !result) resolve(false);
            resolve(result.toObject());
        });
    });
});
controller.getAllRaw = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        resolve(results.map(result => result.toObject()));
    });
});
controller.getOne = (req, res) => new Promise(resolve => {
    Model.findOne({ [`urlName.${req.locale}`]: req.params.urlName }).exec((resultErr, result) => {
        if (resultErr || !result) resolve(false);
        Model.populate(result, [{ path: 'image', select: 'filename' }, { path: 'gallery', populate: [{ path: 'images' }, { path: 'cover' }] }], (populateErr, result) => {
            if (populateErr || !result) resolve(false);
            Promise.all([
                Model.findOne({ _id: { $lt: result._id } }).sort({ _id: -1 }).exec(),
                Model.findOne({ _id: { $gt: result._id } }).sort({ _id: 1 }).exec(),
                Model.find({}).sort({ createdAt: -1 }).limit(4).exec()
            ]).then(surrounding => {
                const sa = {
                    p: surrounding[0] && surrounding[0].toObject() || false,
                    n: surrounding[1] && surrounding[1].toObject() || false,
                    r: surrounding[2] && surrounding[2].map(a => a.toObject()) || false
                };
                result = result.toObject();
                i18nProps.concat(['urlName']).forEach(property => result[property] = result[property][req.locale]);
                if (result.image) result.image = result.image.filename;
                if (result.gallery) result.gallery.images = result.gallery.images.map(i => {
                    i.caption = i.caption[req.locale];
                    return i;
                });
                if (sa.p && sa.p.title && sa.p.urlName) result.prev = { title: sa.p.title[req.locale], urlName: sa.p.urlName[req.locale] };
                if (sa.n && sa.n.title && sa.n.urlName) result.next = { title: sa.n.title[req.locale], urlName: sa.n.urlName[req.locale] };
                if (sa.r && sa.r.title && sa.r.urlName) result.recent = sa.r.map(a => Object.assign({}, { title: a.title[req.locale], urlName: a.urlName[req.locale] }));
                else result.recent = []
                resolve(result);
            });
        });
    });
});
controller.getAll = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).limit(req.limit ? req.limit : 0).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        Model.populate(results, [{ path: 'image', select: 'filename' }], (populateErr, results) => {
            if (populateErr || !results) resolve([]);
            resolve(results.map(result => {
                result = result.toObject();
                i18nProps.concat(['urlName']).forEach(property => {
                    if (result[property] && result[property][req.locale]) result[property] = result[property][req.locale];
                })
                if (result.image) result.image = result.image.filename;
                return result;
            }).filter(res => res.published));
        });
    });
});
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => {
    GalleryController.getAll(req, res).then(galleries => {
        helpers.addGet(res, pathName, { galleries: !galleries ? [] : galleries });
    });
};
controller.admin.addPost = (req, res) => {
    return helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
};
controller.admin.editGet = (req, res) => {
    GalleryController.getAll(req, res).then(galleries => {
        helpers.editGet(req, res, controller, pathName, { galleries: !galleries ? [] : galleries });
    });
};
controller.admin.editPost = (req, res) => {
    return helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
};
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
controller.public.one = (req, res) => helpers.publicOne(req, res, controller, pathName, pathName);
controller.public.all = (req, res) => helpers.publicAll(req, res, controller, pathName, pathName);
controller.public.home = (req, res) => {
    req.limit = 3;
    controller.getAll(req, res).then(results => {
        const locale = req.cookies[appConfig.COOKIE_NAME] || req.locale || 'hu';
        res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}index`, {
            title:      req.title,
            active:     helpers.getPath({ locale: locale, pageKey: 'index' }),
            i18n:       helpers.makeI18n({ locale: locale, pageKey: 'index' }),
            pagespeed:  helpers.pagespeed,
            results:    results,
            locale:     locale,
            index:      true,
            newsPath:   helpers.getPath({ locale: locale, pageKey: 'news' })
        });
    });
};
module.exports = controller;