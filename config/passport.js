const
    LocalStrategy   = require('passport-local').Strategy,
    User            = require('../models/User.js');
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user.id)
        });
    });
    passport.use('local-signup', new LocalStrategy({
        usernameField:      'email',
        passwordField:      'password',
        passReqToCallback:  true
    }, (req, email, password, done) => {
        process.nextTick(() => {
            User.findOne({ email: email }, (err, user) => {
                if (err) return done(err);
                if (user) return done(null, false, req.flash('signupMessage', 'That email is already taken'));
                const newUser = new User({
                    email:      email,
                    firstName:  req.body.firstName,
                    lastName:   req.body.lastName,
                    isAdmin:    req.body.isAdmin ? true : false
                });
                newUser.password = newUser.generateHash(password);
                newUser
                    .save()
                    .then(newUser => {
                        return done(null, newUser);
                    })
                    .catch(reason => {
                        console.log(reason);
                    });
            });
        });
    }));
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({ email: email }, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
            if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Wrong password.'));
            return done(null, user);
        });
    }));
};
