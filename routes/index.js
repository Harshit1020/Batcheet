
var express = require('express');
const passport = require('passport');
const users = require('./users');
var router = express.Router();
var userModel = require('./users')
const crypto = require('crypto');
var nodemailer = require('../nodemailer')
const io = require("socket.io");
const socketapi = require('../socketapi');
const http = require('http');
// for cv
const { v4: uuidv4 } = require("uuid");
const url = require("url");
const path = require("path");
require('dotenv').config();
var GoogleStrategy = require('passport-google-oidc');

// This two line of code adding for passport js 
const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


/* GET home page. */
passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['email', 'profile']
},async function verify(issuer, profile, cb) {
  // console.log(profile);
  let user = await userModel.findOne({ email: profile.emails[0].value })
  
    if (user) {

      return cb(null, user);

    }
    let newUser = new userModel();
    newUser.name = profile.displayName;
  newUser.email = profile.emails[0].value;
  newUser.username = profile.emails[0].value.split('@')[0];
    let result = await newUser.save()
    return cb(null, result);
}));

router.get('/login/federated/google', passport.authenticate('google'));
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

// cv
router.get('/', function (req, res, next) {
  res.render('login');
});

router.get("/join", (req, res) => {
  res.redirect(
    url.format({
      pathname: `/join/${uuidv4()}`,
      query: req.query,
    })
  );
});

router.get("/joinold", (req, res) => {
  res.redirect(
    url.format({
      pathname: req.query.meeting_id,
      query: req.query,
    })
  );
});

router.get("/join/:rooms", (req, res) => {
  res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});
// cv end

router.get('/login', function (req, res, next) {
  res.render('login.ejs');
});


router.get('/profile', isLoggedIn, async function (req, res, next) {
  let user = await users.findOne(req.user)
  console.log(user);
  res.render('profile', { user });
});


router.get('/index', function (req, res, next) {
  res.render('index.ejs');
});

// For reset Password -------------
router.post('/reset/:id', async function (req, res, next) {
  let user = await userModel.findOne({ _id: req.params.id });
  if (user) {
    user.setPassword(req.body.newpassword, async function () {
      user.otp = '';
      await user.save();
      res.send('password changed !');
    })
  } else {
    res.send("not changed")
  }
  // -------------------
});
router.get('/forgot', function (req, res, next) {
  res.render('forgot');
});

// for regitering a user or create new user account
router.post('/register', function (req, res) {
  var newUser = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email
  })
  userModel.register(newUser, req.body.password).then(function () {
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile');
    })
  })
    .catch(function (err) {
      res.send(err);
    })
});

// after creating a user login by using username and password
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function (req, res, next) { });


// for logout 
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
// forgot route 
router.post('/forgot', async function (req, res) {
  // sabse phle user dhundo jiska email likha tha forgot par 
  userModel.findOne({ email: req.body.email })
    .then(function (user) {
      if (user) {
        // agr wo mil jaye , to fir crypto ke through ek 18 character s ki link banaye 
        crypto.randomBytes(17, async function (err, buffer) {
          const otpstr = buffer.toString('hex');
          // us string ko save krdo databse m otp me 
          user.otp = otpstr;
          await user.save();
          // abb ek mail bhejo us bande ko jisne mail diya tha 
          nodemailer(req.body.email, otpstr, user._id).then(function () {
            console.log('mail sent');
          })
        })
      }
      else {
        res.send("no such user found !");
      }
    })
})
//for verifying otp 
router.get('/forgot/:id/otp/:otp', async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.id })
  if (user.otp === req.params.otp) {
    res.render('reset', { _id: req.params.id });
  }
  else {
    res.send("expired link ! wrong ");
  }
})
// IsLoggedIn Middleware for not accesing the details by route
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}
module.exports = router;
