const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, myDataBase) {
    // Passport serializeUser
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // Passport deserializeUser
    passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, doc);
        });
    });

    // Passport will use LocalStrategy
    passport.use(new LocalStrategy(
        function (username, password, done) {
            myDataBase.findOne({ username: username }, function (err, user) {
                console.log('User ' + username + ' attempted to log in.');
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
                return done(null, user);
            });
        }
    ));
}