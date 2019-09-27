const
    fs          = require('fs'),
    path        = require('path'),
    formidable  = require('formidable'),
    Model       = require(path.join(__dirname, '..', 'models', 'Product.js')),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    appConfig   = require(path.join(__dirname, '..', 'config', 'app.json')),
    messages    = helpers.messages.PRODUCT,
    controller  = {
        admin:      {},
        public:     {}
    },
    pathName    = 'products',
    property    = 'name',
    obj         = (req) => {
        const fields = req.body;
        ['mfr', 'density', 'tensileModulus', 'yieldStress', 'flexuralModulus', 'hdt'].forEach(key => {
            if (fields[key] && fields[key].indexOf(',') > -1) fields[key] = fields[key].replace(',', '.');
        });
        ['u23', 'u20', 'n23', 'nm20'].forEach(key => {
            if (fields[`impactStrength-${key}`]) {
                fields[`impactStrength-${key}`] = fields[`impactStrength-${key}`].toLowerCase();
                if (fields[`impactStrength-${key}`].indexOf('n') > -1 && fields[`impactStrength-${key}`].indexOf('b') > -1) fields[`impactStrength-${key}`] = 'nb';
                if (fields[`impactStrength-${key}`].indexOf('n') > -1 && fields[`impactStrength-${key}`].indexOf('d') > -1) fields[`impactStrength-${key}`] = 'nd';
                if (fields[`impactStrength-${key}`].indexOf(',') > -1) fields[`impactStrength-${key}`] = fields[`impactStrength-${key}`].replace(',', '.');
            }
        });
        ['talc', 'chalk', 'mica', 'glassFibre', 'bariumSulphate', 'elastomer', 'woodFibre', 'differentFiller'].forEach(key => {
            if (fields[`fillerType-${key}`] && fields[`fillerType-${key}`].indexOf(',') > -1) fields[`fillerType-${key}`] = fields[`fillerType-${key}`].replace(',', '.');
        });
        const obj = {
            //_id:                fields.id,
            name:               fields.name,
            polymerType:        fields.polymerType,
            extrusion:          [],
            injectionMoulding:  [],
            mfr:                fields.mfr,
            density:            fields.density,
            tensileModulus:     fields.tensileModulus,
            yieldStress:        fields.yieldStress,
            impactStrength:     {
                u23:                fields['impactStrength-u23'],
                u20:                fields['impactStrength-u20'],
                n23:                fields['impactStrength-n23'],
                nm20:               fields['impactStrength-nm20']
            },
            flexuralModulus:    fields.flexuralModulus,
            hdt:                fields.hdt,
            frClass:            fields.frClass,
            scratchResistance:  fields.scratchResistance,
            uvResistance:       fields.uvResistance,
            fillerType:         {
                talc:               fields['fillerType-talc'],
                chalk:              fields['fillerType-chalk'],
                mica:               fields['fillerType-mica'],
                glassFibre:         fields['fillerType-glassFibre'],
                bariumSulphate:     fields['fillerType-bariumSulphate'],
                elastomer:          fields['fillerType-elastomer'],
                woodFibre:          fields['fillerType-woodFibre'],
                differentFiller:    fields['fillerType-differentFiller']
            },
            pdfUrl:             fields.pdfUrl
        };
        appConfig.PRODUCT.EXTRUSIONS.forEach(x => fields[`extrusion-${x}`] ? obj.extrusion.push(x) : () => {});
        appConfig.PRODUCT.INJECTION_MOULDINGS.forEach(x => fields[`injectionMoulding-${x}`] ? obj.injectionMoulding.push(x) : () => {});
        return obj;
    };
controller.getOneRaw = (req, res) => new Promise(resolve => {
    Model.findById(req.params.id, (resultErr, result) => {
        if (resultErr || !result) resolve(false);
        resolve(result.toObject());
    });
});
controller.getAllRaw = (req, res) => new Promise(resolve => {
    Model.find({}).sort({ createdAt: -1 }).exec((resultsErr, results) => {
        if (resultsErr || !results) resolve([]);
        resolve(results.map(result => result.toObject()));
    });
});
controller.getOne = (req, res) => controller.getOneRaw(req, res);
controller.getAll = (req, res) => controller.getAllRaw(req, res);
controller.admin.all = (req, res) => helpers.adminAll(req, res, controller, pathName);
controller.admin.addGet = (req, res) => helpers.addGet(res, pathName, {
    extrusions:         appConfig.PRODUCT.EXTRUSIONS,
    injectionMouldings: appConfig.PRODUCT.INJECTION_MOULDINGS,
    polymerTypes:       appConfig.PRODUCT.POLYMER_TYPES
});
controller.admin.addPost = (req, res) => {
    const
        uploadFolder = appConfig.UPLOAD_FOLDER,
        d = new Date(),
        year = `${d.getFullYear()}`,
        month = `${d.getFullMonth()}`,
        date = `${d.getDate()}`,
        mimetypes = ['application/pdf'];
    console.log(req.file, req.body)
    if (req.file) {
        const
            oname = req.file.originalname.toLowerCase(),
            filename = `${req.file.filename}.${oname.split('.')[oname.split('.').length - 1]}`;
        if (-1 === mimetypes.indexOf(req.file.mimetype)) {
            log({ type: 'error', message: msg.IMAGE.INVALID_TYPE_ERR });
            req.session.message = msg.IMAGE.INVALID_TYPE_ERR;
            return res.redirect(`/admin/${pathName}`);
        }
        helpers
            .checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year))
            .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month)))
            .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month, date)))
            .then(() => helpers.copy(req.file.destination + req.file.filename, path.join(__dirname, '..', uploadFolder, '..', year, month, date, filename)))
            .then(() => new Promise(resolve => {
                req.body.pdfUrl = `/${path.join('assets', 'uploads', year, month, date, filename).replace(/\\/g, '/')}`;
                helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
            }));
    }
    helpers.addPost(req, res, Model, obj(req), messages, pathName, property);
};
controller.admin.editGet = (req, res) => helpers.editGet(req, res, controller, pathName, {
    extrusions:         appConfig.PRODUCT.EXTRUSIONS,
    injectionMouldings: appConfig.PRODUCT.INJECTION_MOULDINGS,
    polymerTypes:       appConfig.PRODUCT.POLYMER_TYPES
});
controller.admin.editPost = (req, res) => {
    const
        uploadFolder = appConfig.UPLOAD_FOLDER,
        d = new Date(),
        year = `${d.getFullYear()}`,
        month = `${d.getFullMonth()}`,
        date = `${d.getDate()}`,
        mimetypes = ['application/pdf'];
    console.log(req.file, req.body);
    if (req.file) {
        const
            oname = req.file.originalname.toLowerCase(),
            filename = `${req.file.filename}.${oname.split('.')[oname.split('.').length - 1]}`;
        if (-1 === mimetypes.indexOf(req.file.mimetype)) {
            log({ type: 'error', message: msg.INVALID_TYPE_ERR });
            req.session.message = msg.INVALID_TYPE_ERR;
            return res.redirect(`/admin/${pathName}`);
        }
    helpers
        .checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year))
        .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month)))
        .then(() => helpers.checkAndCreate(path.join(__dirname, '..', uploadFolder, '..', year, month, date)))
        .then(() => helpers.copy(req.file.destination + req.file.filename, path.join(__dirname, '..', uploadFolder, '..', year, month, date, filename)))
        .then(() => new Promise(resolve => {
            req.body.pdfUrl = `/${path.join('assets', 'uploads', year, month, date, filename).replace(/\\/g, '/')}`;
            if (req.body.origpdfUrl) {
                delete req.body.origpdfUrl;
            }
            helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
        }));
    } else {
        req.body.pdfUrl = req.body.origpdfUrl;
        delete req.body.origpdfUrl;
        helpers.editPost(req, res, Model, obj(req), messages, pathName, property);
    }
};
controller.admin.deleteGet = (req, res) => helpers.deleteGet(req, res, Model, messages, pathName, property);
controller.public.all = (req, res) => helpers.publicAll(req, res, controller, pathName);
controller.public.finder = (req, res) => {
    const
        fillerTypes     = ['noFill', 'talc', 'chalk', 'glassFibre', 'elastomer', 'fillElastomer', 'other'],
        lists           = {
            injectionMoulding:  {},
            extrusion:          {}
        };
    Model.find({}, (resultsErr, results) => {
        if (resultsErr || !results) results = [];
        results = results
            .filter(r => r !== null && r !== undefined)
            .map(r => results.length ? r.toObject() : r)
            .map(r => {
                if (!r.fillerType.differentFiller) r.fillerType.differentFiller = false;
                return r;
            });
        const polymerTypes = results
            .map(r => r.polymerType)
            .filter((polymerType, index, array) => polymerType !== null && polymerType !== undefined && array.indexOf(polymerType) === index);
        Object.keys(lists).forEach(key => {
            polymerTypes.forEach(polymerType => {
                lists[key][polymerType] = {};
                fillerTypes.forEach(column => lists[key][polymerType][column] = []);
            });
        });
        results.forEach(result => {
            Object.keys(lists).forEach(listKey => {
                if (result[listKey] && result[listKey].length) {
                    Object.keys(lists[listKey]).forEach(polymerType => {
                        if (result.polymerType === polymerType) {
                            delete result.fillerType.differentFiller;
                            const
                                resultFillerTypes = Object.keys(result.fillerType).filter(fillerType => result.fillerType[fillerType] !== ''),
                                hasTalc = -1 < resultFillerTypes.indexOf('talc'),
                                hasChalk = -1 < resultFillerTypes.indexOf('chalk'),
                                hasGlassFibre = -1 < resultFillerTypes.indexOf('glassFibre'),
                                hasMica = -1 < resultFillerTypes.indexOf('mica'),
                                hasBariumSulphate = -1 < resultFillerTypes.indexOf('bariumSulphate'),
                                hasElastomer = -1 < resultFillerTypes.indexOf('elastomer'),
                                hasWoodFibre = -1 < resultFillerTypes.indexOf('woodFibre'),
                                unFilled = !resultFillerTypes.length,
                                fillElastomer = hasElastomer && 1 < resultFillerTypes.length,
                                thisList = lists[listKey][polymerType];
                            if (unFilled) thisList.noFill.push(result);
                            if (hasTalc) thisList.talc.push(result);
                            if (hasChalk) thisList.chalk.push(result);
                            if (hasGlassFibre) thisList.glassFibre.push(result);
                            if (hasMica || hasBariumSulphate || hasWoodFibre) thisList.other.push(result);
                            if (hasElastomer) thisList.elastomer.push(result);
                            if (fillElastomer) thisList.fillElastomer.push(result);
                        }
                    });
                }
            });
        });
        res.render(`${appConfig.PUBLIC_VIEWS_PREFIX}product-finder`, {
            title:      req.title,
            active:     helpers.getPath({ locale: req.locale, pageKey: 'product-finder' }),
            i18n:       helpers.makeI18n({ locale: req.locale, pageKey: 'product-finder' }),
            pagespeed:  helpers.pagespeed,
            results:    lists,
            columns:    fillerTypes,
            locale:     req.locale,
            polymerShorts: appConfig.PRODUCT.POLYMER_SHORT
        });
    });
};
module.exports = controller;