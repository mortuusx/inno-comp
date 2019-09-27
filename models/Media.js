const
    path            = require('path'),
    mongoose        = require('mongoose'),
    databaseConfig  = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers         = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema          = mongoose.Schema,
    MediaSchema     = new Schema({
        id:             { type: Schema.Types.ObjectId, required: true },
        type:           { type: String, enum: ['Video', 'Image'] }
    });
module.exports = mongoose.model('Media', MediaSchema);