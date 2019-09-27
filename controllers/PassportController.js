const
    path        = require('path'),
    helpers     = require(path.join(__dirname, '..', 'lib', 'helpers.js')),
    gpath       = helpers.getPath;
module.exports = {
    login: (passport, locale) => passport.authenticate('local-login', {
        successRedirect:    `/admin`,
        failureRedirect:    `/${gpath({ locale: locale, pageKey: 'login' })}`,
        failureFlash:       true
    }),
    signup: (passport, locale) => passport.authenticate('local-signup', {
        successRedirect:    `/${gpath({ locale: locale, pageKey: 'profile' })}`,
        failureRedirect:    `/${gpath({ locale: locale, pageKey: 'signup' })}`,
        failureFlash:       true
    }),
    logout: (req, res) => {
        req.logout();
        res.redirect(`/${gpath({ locale: locale, pageKey: 'index' })}`);
    }
};