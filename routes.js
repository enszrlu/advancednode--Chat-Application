const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {

    app.route('/').get((req, res) => {
        res.render(__dirname + '/views/pug/index', {
            title: 'Connected to Database',
            message: 'Please login',
            showLogin: true,
            showRegistration: true,
            message: req.flash('message'),
            showSocialAuth: true
        });
    });

    // login API
    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile')
    });

    // Profile page
    app.route('/profile').get(ensureAuthenticated, (req, res) => {
        res.render(__dirname + '/views/pug/profile', { username: req.user.username });
    });

    //logout API
    app.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        });

    //register API
    app.route('/register')
        .post((req, res, next) => {
            myDataBase.findOne({ username: req.body.username }, function (err, user) {
                if (err) {
                    next(err);
                } else if (user) {
                    req.flash('message', 'Username is already registered, please try different username');
                    res.redirect('/');
                } else {
                    const hash = bcrypt.hashSync(req.body.password, 12);
                    myDataBase.insertOne({
                        username: req.body.username,
                        password: hash
                    },
                        (err, doc) => {
                            if (err) {
                                res.redirect('/');
                            } else {
                                // The inserted document is held within
                                // the ops property of the doc
                                next(null, doc.ops[0]);
                            }
                        }
                    )
                }
            })
        },
            passport.authenticate('local', { failureRedirect: '/' }),
            (req, res, next) => {
                res.redirect('/profile');
            }
        );

    // Github login API
    app.route('/auth/github').get(passport.authenticate('github'));

    // Github Redirect Back
    app.route('/auth/github/callback')
        .get(passport.authenticate('local', { failureRedirect: '/loginNoNoNo' }), (req, res) => {
            res.redirect('/profile');
        });

    //error handling
    app.use((req, res, next) => {
        console.log(req.url)
        /* res.status(404)
          .type('text')
          .send('Not Found'); */
        res.render(__dirname + '/views/pug/notfound', { url: req.url });
    });

}


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};