const
    path            = require('path'),
    mongoose        = require('mongoose'),
    databaseConfig  = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers         = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema          = mongoose.Schema,
    JobSchema       = new Schema({
        createdAt:      { type: Date },
        updatedAt:      { type: Date },
        position:       {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        tasks:          {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        expectations:   {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        info:           {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        contact:        {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        deadline:       {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        published:      { type: Boolean, required: true }
    });
JobSchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    next();
});
module.exports = mongoose.model('Job', JobSchema);