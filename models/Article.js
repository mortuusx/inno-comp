const
    path            = require('path'),
    mongoose        = require('mongoose'),
    databaseConfig  = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers         = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema          = mongoose.Schema,
    ArticleSchema   = new Schema({
        author:         { type: String },
        createdAt:      { type: Date },
        updatedAt:      { type: Date },
        urlName:        {
            en:             { type: String },
            hu:             { type: String },
            cz:             { type: String },
            de:             { type: String }
        },
        title:          {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        content:        {
            en:             { type: String, required: true },
            hu:             { type: String, required: true },
            cz:             { type: String, required: true },
            de:             { type: String, required: true }
        },
        image:          { type: Schema.Types.ObjectId, ref: 'Image', required: false },
        gallery:        { type: Schema.Types.ObjectId, ref: 'Gallery', required: false },
        published:      { type: Boolean, required: true }
    });
ArticleSchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    this.author = 'Inno-Comp';
    this.urlName.en = helpers.urlNamify(this.title.en);
    this.urlName.hu = helpers.urlNamify(this.title.hu);
    this.urlName.cz = helpers.urlNamify(this.title.cz);
    this.urlName.de = helpers.urlNamify(this.title.de);
    mongoose.model('Article').findOne({ 'urlName.hu': this.urlName.hu }, (articleErr, article) => {
        if (articleErr || !article) next();
        const postfix = Math.floor(Math.random() * 100000);
        this.urlName.hu = `${this.urlName.hu}-${postfix}`;
        this.urlName.en = `${this.urlName.en}-${postfix}`;
        this.urlName.cz = `${this.urlName.cz}-${postfix}`;
        this.urlName.de = `${this.urlName.de}-${postfix}`;
        next();
    });
});
module.exports = mongoose.model('Article', ArticleSchema);