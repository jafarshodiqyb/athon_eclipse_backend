var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const loginHistory = require('../models/login-history');
var cors = require('cors')
var router = express.Router();
router.use(bodyParser.json());

router.get('/', authenticate.verifyUser, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content_type', 'application/json');
      res.json(users);
    }
  })
});

router.post('/register', cors(), (req, res, next) => {
  User.register(new User({
      username: req.body.username,
    }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          err: err
        });
      } else {
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
        }
        user.save((err, user) => {
          passport.authenticate('local')(req, res, () => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                err: err
              });
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              status: 'Registration Successful!'
            });
          });
        });
      }
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({
    _id: req.user._id,
    firstname: req.user.firstname,
    lastname: req.user.lastname
  });
  loginhist = new loginHistory({
    username : req.body.username,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    lastLogin : Date()
  }) 
  loginhist.save((err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      status: 'You are successfully logged in!',
      username : user.username,
      firstName : user.firstName,
      lastName : user.lastName,
      token: token
    });
  })
});


router.get('/logout', function(req, res) {
  req.logout();
res.status(200).json({
  status: 'Bye!'
});
});

module.exports = router;