//Done.
const
    path        = require('path'),
    Model       = require(path.join(__dirname, '..', 'models', 'Program.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    messages    = helpers.messages.PROGRAM,
    controller  = {
        admin:      {},
        public:     {}
    },
    i18nProps   = ['title', 'type', 'subtitle', 'lead', 'content', 'amount', 'info'],
    pathName    = 'programs',
    property    = 'title',
    obj         = (req) => {
        const obj = {};
        i18nProps.forEach(field => {
            obj[field] = {};
            ['en', 'hu', 'cz', 'de'].forEach(locale => obj[field][locale] = req.body[`${field}-${locale}`]);
        });
        obj.year = req.body.year;
        obj.published = req.body.published ? true : false
        if (req.body.images) obj.image = req.body.images && JSON.parse(req.body.images).length ? JSON.parse(req.body.images)[0] : null;
        return obj;
    };

controller.getOneRaw = (req, res) => new Promise(resolve => {
    Model.findById(req.params.id, (resultErr, result) => {
        if (resultErr || !result) resolve(false);
        Model.populate(result, [{ path: 'image', model: 'Image' }], (populateErr, result) => {
            if (populateErr || !result) resolve(false);
            resolve(result.toObject());
        });
    });
});

controller.getAllRaw = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).limit(req.limit ? req.limit : 0).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        Model.populate(results, [{ path: 'image', model: 'Image' }], (populateErr, results) => {
            if (populateErr || !results) resolve([]);
            resolve(results.map(result => result.toObject()));
        });
    });
});
controller.getOne = (req, res) => new Promise(resolve => {
    Model.findOne({ [`urlName.${req.locale}`]: req.params.urlName }).exec((resultErr, result) => {
        if (resultErr || !result) resolve(false);
        Model.populate(result, [{ path: 'image', model: 'Image' }], (populateErr, result) => {
            if (populateErr || !result) resolve(false);
            Promise.all([
                Model.findOne({ _id: { $lt: result._id } }).sort({ _id: -1 }).exec(),
                Model.findOne({ _id: { $gt: result._id } }).sort({ _id: 1 }).exec()
            ]).then(surrounding => {
                const sp = {
                    p: surrounding[0] && surrounding[0].toObject() || false,
                    n: surrounding[1] && surrounding[1].toObject() || false
                };
                result = result.toObject();
                i18nProps.concat(['urlName']).forEach(property => result[property] = result[property][req.locale]);
                if (sp.p) result.prev = { title: sp.p.title[req.locale], urlName: sp.p.urlName[req.locale] };
                if (sp.n) result.next = { title: sp.n.title[req.locale], urlName: sp.n.urlName[req.locale] };
                resolve(result);
            });
        });
    });
});
controller.getAll = (req, res) => new Promise(resolve => {
    controller.getAllRaw(req, res).then(results => {
        resolve(results.map(result => {
            i18nProps.concat(['urlName']).forEach(property => result[property] = result[property][req.locale]);
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
controller.public.one = (req, res) => helpers.publicOne(req, res, controller, pathName, pathName)
controller.public.all = (req, res) => helpers.publicAll(req, res, controller, pathName, pathName);
module.exports = controller;