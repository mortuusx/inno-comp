//Done.
const
    path        = require('path'),
    Model       = require(path.join(__dirname, '..', 'models', 'Job.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    messages    = helpers.messages.JOB,
    controller  = {
        admin:      {},
        public:     {}
    },
    i18nProps   = ['position', 'tasks', 'expectations', 'info', 'contact', 'deadline'],
    pathName    = 'jobs',
    property    = 'position',
    obj         = (req) => {
        const obj = {};
        i18nProps.forEach(field => {
            obj[field] = {};
            ['en', 'hu', 'cz', 'de'].forEach(locale => obj[field][locale] = req.body[`${field}-${locale}`]);
        });
        obj.published = req.body.published ? true : false
        return obj;
    };
controller.getOneRaw = (req, res) => new Promise(resolve => {
    Model.findById(req.params.id, (resultErr, result) => {
        if (resultErr || !result) resolve(false);
        resolve(result.toObject());
    });
});
controller.getAllRaw = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        resolve(results.map(result => result.toObject()));
    });
});
controller.getAll = (req, res) => new Promise(resolve => {
    controller.getAllRaw(req, res).then(results => {
        resolve(results.map(result => {
            i18nProps.forEach(property => result[property] = result[property][req.locale]);
            return result;
        }).filter(res => res.published));
    });
});
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => helpers.addGet(res, pathName);
controller.admin.addPost = (req, res) => helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.editGet = (req, res) => helpers.editGet(req, res, controller, pathName);
controller.admin.editPost = (req, res) => helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
controller.public.all = (req, res) => helpers.publicAll(req, res, controller, pathName, pathName);
module.exports = controller;