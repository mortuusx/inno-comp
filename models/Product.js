const
    path                    = require('path'),
    appConfig               = require(path.join(__dirname, '..', 'config', 'app.json')),
    mongoose                = require('mongoose'),
    databaseConfig          = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers                 = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema                  = mongoose.Schema,
    polymerTypes            = appConfig.PRODUCT.POLYMER_TYPES,
    extrusions              = appConfig.PRODUCT.EXTRUSIONS,
    injectionMouldings      = appConfig.PRODUCT.INJECTION_MOULDINGS,
    frClasses               = ['', 'V-0', 'V-2'],
    ProductSchema           = new Schema({
        name:                   { type: String, required: true },
        polymerType:            { type: String, enum: polymerTypes },
        extrusion:              [{ type: String, enum: extrusions }],
        injectionMoulding:      [{ type: String, enum: injectionMouldings }],
        mfr:                    { type: String, required: true },
        density:                { type: String, required: true },
        tensileModulus:         { type: String },
        yieldStress:            { type: String },
        impactStrength:         {
            u23:                    { type: String },
            u20:                    { type: String },
            n23:                    { type: String },
            nm20:                   { type: String }
        },
        flexuralModulus:        { type: String },
        hdt:                    { type: String },
        frClass:                { type: String, enum: frClasses },
        scratchResistance:      { type: Boolean, required: true },
        uvResistance:           { type: Boolean, required: true },
        fillerType:             {
            talc:                   { type: String },
            chalk:                  { type: String },
            mica:                   { type: String },
            glassFibre:             { type: String },
            bariumSulphate:         { type: String },
            elastomer:              { type: String },
            woodFibre:              { type: String },
            differentFiller:        { type: Boolean }
        },
        pdfUrl:                 { type: String }
    });
ProductSchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    next();
});
module.exports = mongoose.model('Product', ProductSchema);