//Done.
const
    path        = require('path'),
    Model       = require(path.join(__dirname, '..', 'models', 'User.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    messages    = helpers.messages.USER,
    controller  = {
        admin:      {},
        public:     {}
    },
    pathName    = 'users',
    property    = 'email',
    obj         = (req) => {
        const obj = {};
        ['email', 'password', 'firstName', 'lastName'].forEach(field => obj[field] = req.body[field]);
        obj.isAdmin = req.body.isAdmin ? req.body.isAdmin : false;
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
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => helpers.addGet(res, pathName);
controller.admin.addPost = (req, res) => helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.editGet = (req, res) => helpers.editGet(req, res, controller, pathName);
controller.admin.editPost = (req, res) => helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
module.exports = controller;