const
    path        = require('path'),
    mongoose    = require('mongoose'),
    appConfig   = require(path.join(__dirname, '..', 'config', 'app.json')),
    Image       = require(path.join(__dirname, '..', 'models', 'Image.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    log         = helpers.log,
    msg         = helpers.messages,
    messages    = helpers.messages.IMAGE,
    i18nProps   = ['caption'],
    Model       = Image,
    controller  = {
        admin:      {},
        public:     {}
    },
    pathName    = 'media',
    property    = 'caption',
    obj         = (req) => {
        const obj = {};
        i18nProps.forEach(field => {
            obj[field] = {};
            ['en', 'hu', 'cz', 'de'].forEach(locale => obj[field][locale] = req.body[`${field}-${locale}`]);
        });
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
        }));
    });
});
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => helpers.addGet(res, pathName);
controller.admin.addPost = (req, res) => {
    const
        uploadFolder = appConfig.UPLOAD_FOLDER,
        d = new Date(),
        year = `${d.getFullYear()}`,
        month = `${d.getFullMonth()}`,
        date = `${d.getDate()}`,
        mimetypes = ['image/jpeg', 'image/pjpeg', 'image/png'/*, 'video/mp4'*/];
    Promise
        .all(req.files.map((file, index) => {
            const
                oname = file.originalname.toLowerCase(),
                filename = `${file.filename}.${oname.split('.')[oname.split('.').length - 1]}`;
            if (-1 === mimetypes.indexOf(file.mimetype)) {
                log({ type: 'error', message: msg.IMAGE.INVALID_TYPE_ERR });
                req.session.message = msg.IMAGE.INVALID_TYPE_ERR;
                return res.redirect(`/admin/${pathName}`);
            }
            return helpers
                .checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year))
                .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month)))
                .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month, date)))
                .then(() => helpers.copy(file.destination + file.filename, path.join(__dirname, '..', uploadFolder, '..', year, month, date, filename)))
                .then(() => new Image({
                    filename:   `/${path.join('assets', 'uploads', year, month, date, filename).replace(/\\/g, '/')}`,
                    caption:      {
                        hu:         index,
                        en:         index,
                        cz:         index,
                        de:         index
                    }
                }).save());
        }))
        .then(images => {
            log({ message: msg.IMAGE.SAVED, value: images });
            req.session.message = `${msg.IMAGE.SAVED}: ${images.map(i => i.caption.hu).join(', ')}`;
            res.redirect(`/admin/${pathName}`);
        }, reason => {
            log({ type: 'error', message: msg.IMAGE.SAVE_ERR, value: reason });
            req.session.message = `${msg.IMAGE.SAVE_ERR}: ${reason}`;
            res.redirect(`/admin/${pathName}`);
        });
};
controller.admin.editGet = (req, res) => helpers.editGet(req, res, controller, pathName);
controller.admin.editPost = (req, res) => helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
controller.public.json = (req, res) => {
    controller.getAll(req, res).then(results => {
        if (!results) results = [];
        results = results.map(result => {
            result.caption = result.caption[req.locale];
            return result;
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(results));
    });
}
module.exports = controller;