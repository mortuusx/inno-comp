const
    path            = require('path'),
    mongoose        = require('mongoose'),
    bcrypt          = require('bcrypt-nodejs'),
    databaseConfig  = require(path.join(__dirname, '..', 'config', 'database.json')),
    helpers         = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    Schema          = mongoose.Schema,
    UserSchema      = new Schema({
        createdAt:      { type: Date },
        updatedAt:      { type: Date },
        email:          { type: String, required: true },
        password:       { type: String, required: true },
        firstName:      { type: String, required: true },
        lastName:       { type: String, required: true },
        isAdmin:        { type: Boolean, required: true, default: false }
    });
UserSchema.virtual('fullName').get(() => `${this.lastName} ${this.firstName}`);
UserSchema.methods.generateHash = password =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
UserSchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = new Date();
    this.updatedAt = new Date();
    this.password = this.generateHash(this.password);
    next();
});
module.exports = mongoose.model('User', UserSchema);