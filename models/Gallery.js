const
    path            = require('path'),
    mongoose        = require('mongoose'),
    databaseConfig  = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers         = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema          = mongoose.Schema,
    GallerySchema   = new Schema({
        createdAt:      { type: Date },
        updatedAt:      { type: Date },
        title:          {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        lead:           {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        images:         [{ type: Schema.Types.ObjectId, ref: 'Image', required: true }],
        cover:          { type: Schema.Types.ObjectId, ref: 'Image', required: true }
    });
GallerySchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    next();
});
module.exports = mongoose.model('Gallery', GallerySchema);