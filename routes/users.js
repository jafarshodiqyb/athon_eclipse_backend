var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('cors')
var router = express.Router();
var jwt = require('jsonwebtoken');

router.use(bodyParser.json());

router.get('/:user', authenticate.verifyUser, (req, res, next) => {
  var user = req.params.user
  User.find({username:user}, (err, users) => {
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
        if (req.body.address){
          user.address = req.body.address;
        }else user.address = ""
        if (req.body.image){
          user.image = req.body.image;
        } else user.image = ""
        if (req.body.motto){
          user.motto = req.body.motto;
        }else user.motto = ""
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
router.put('/update-user',authenticate.verifyUser, (req, res, next) => {
  User.findOneAndUpdate(
    { username:req.body.username },
    
        req.body
    ,
    (err,update)=>{
      if (err) {
        return next(err);
      } else{
        console.log(update)
        res.statusCode = 200;
        res.setHeader('Content_type', 'application/json');
        res.json(update);
      }
    })

});

router.get(
  "/auth/google",
  passport.authenticate("google",{scope: ["profile", "email"]}))
router.get('/auth/google/redirect',(req,res,next)=>{

  passport.authenticate('google',function(err,user,info){
    var token = authenticate.getToken(user);
    var payload = {
      token: token,
      username: user.username,
      // firstName: user.firstName,
      // lastName: user.lastName,
      // address: user.address || "",
      // motto: user.motto|| "",
      // image: user.image|| "",

    }
    res.redirect('http://localhost:3006/login/' +new URLSearchParams(payload))

  })(req,res,next);


})
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
      var token = authenticate.getToken(user);
        res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        username : user.username,
        // firstName : user.firstName,
        // lastName : user.lastName,
        // address: user.address || "",
        // motto: user.motto|| "",
        // image: user.image|| "",

              // token: token
      });
    
  })(req,res,next);
});

router.get('/logout', function(req, res) {
  req.logout();
res.status(200).json({
  status: 'Bye!'
});
});

router.get('/refresh-token/:user', authenticate.verifyUser, (req, res, next) => {
  var user = req.params.user
  User.find({username:user}, (err, users) => {
    console.log(users)
    if (err) {
      return next(err);
    } else {
      var token = authenticate.getToken(users);
        res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        username : user,

              // token: token
      });
    }
  })
});
module.exports = router;