'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();

//set view engine to pug
app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Using Express-Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Use Flash
app.use(flash());

//Use Passport
app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
