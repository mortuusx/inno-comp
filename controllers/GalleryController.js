//Done.
const
    fs          = require('fs'),
    path        = require('path'),
    Model       = require(path.join(__dirname, '..', 'models', 'Gallery.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    messages    = helpers.messages.GALLERY,
    controller  = {
        admin: {},
        public: {}
    },
    i18nProps   = ['title', 'lead'],
    pathName    = 'galleries',
    property    = 'title',
    obj         = (req) => {
        const obj = {};
        i18nProps.forEach(field => {
            obj[field] = {};
            ['en', 'hu', 'cz', 'de'].forEach(locale => obj[field][locale] = req.body[`${field}-${locale}`]);
        });
        obj.images = req.body.images ? JSON.parse(req.body.images) : [];
        obj.cover = req.body.cover && req.body.images ? req.body.cover : JSON.parse(req.body.images)[0];
        return obj;
    };
    
controller.getOneRaw = (req, res) => new Promise(resolve => {
    Model.findById(req.params.id, (resultErr, result) => {
        if (resultErr || !result) resolve(false);
        Model.populate(result, [{ path: 'images' }, { path: 'cover' }], (populateErr, result) => {
            if (populateErr || !result) resolve(false);
            resolve(result.toObject());
        });
    });
});
controller.getAllRaw = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        Model.populate(results, [{ path: 'images' }, { path: 'cover' }], (populateErr, results) => {
            if (populateErr || !results) resolve([]);
            resolve(results.map(result => result.toObject()));
        });
    });
});
controller.getOne = (req, res) => new Promise(resolve => {
    controller.getOneRaw(req, res).then(result => {
        i18nProps.forEach(property => result[property] = result[property][req.locale]);
        if (result.images) {
            result.images = result.images.map(image => {
                image.caption = image.caption[req.locale];
                return image;
            });
        }
        if (result.cover && result.cover.caption) result.cover.caption = result.cover.caption[req.locale];
        resolve(gallery);
    });
});
controller.getAll = (req, res) => new Promise(resolve => {
    controller.getAllRaw(req, res).then(results => {
        if (!results.length) return resolve([]);
        resolve(results.map(result => {
            i18nProps.forEach(property => result[property] = result[property][req.locale]);
            if (result.images) {
                result.images = result.images.map(image => {
                    if (image.caption) image.caption = image.caption[req.locale];
                    return image;
                });
            }
            if (result.cover && result.cover.caption) result.cover.caption = result.cover.caption[req.locale];
            return result;
        }));
    });
});
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => helpers.addGet(res, pathName);
controller.admin.addPost = (req, res) => helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.editGet = (req, res) => helpers.editGet(req, res, controller, pathName);
controller.admin.editPost = (req, res) => helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
controller.public.all = (req, res) => helpers.publicAll(req, res, controller, pathName);
module.exports = controller;