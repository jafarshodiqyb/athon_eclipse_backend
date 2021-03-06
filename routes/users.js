var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('cors')
var router = express.Router();
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../helpers/email');

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
      isSetPassword :true,
      email : req.body.email
    }),
    req.body.password, async (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          message: 'A user with the given username or email is already registered'
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
        if (req.body.job){
          user.job = req.body.job;
        }else user.job = ""
        user.verifyToken= crypto.randomBytes(64).toString('hex'),
        await sendEmail(user, process.env.SERVER_URL);
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
              status: 'Registration Successful. Please check email for verification!'
            });
          });
        });
      }
    });
});
router.put('/update-user',authenticate.verifyUser,(req, res, next) => {
User.findByIdAndUpdate( { _id:req.body.id },req.body,{new:"true"},(err,update)=>{
  if (err) {
        console.log(err.codeName)
        return next(err.codeName=='DuplicateKey'?{message:'Username Already Exist'}:err);
      } else{
        console.log(update)
        res.statusCode = 200;
        res.setHeader('Content_type', 'application/json');
        res.json(update);
      }
    })

})


router.get(
  "/auth/google",
  passport.authenticate("google",{scope: ["profile", "email"]}))

router.get('/auth/google/redirect',(req,res,next)=>{
  passport.authenticate('google',function(err,user,info){
    var token = authenticate.getToken(user);
    var payload = {
      token: token,
    }
    res.redirect(`${process.env.CLIENT_URL}/login/` +new URLSearchParams(payload))
  })(req,res,next);
})

router.get(
  "/auth/facebook",
  passport.authenticate("facebook",{scope: "email"}))

router.get('/auth/facebook/redirect',(req,res,next)=>{
  passport.authenticate('facebook',function(err,user,info){
    var token = authenticate.getToken(user);
    var payload = {
      token: token,
    }
    res.redirect(`${process.env.CLIENT_URL}/login/` +new URLSearchParams(payload))
  })(req,res,next);
})

  
router.get(
  "/auth/instagram",
  passport.authenticate("instagram"))

router.get('/auth/instagram/redirect',(req,res,next)=>{
  passport.authenticate('instagram',function(err,user,info){
    var token = authenticate.getToken(user);
    var payload = {
      token: token,
    }
    res.redirect(`${process.env.CLIENT_URL}/login/` +new URLSearchParams(payload))
  })(req,res,next);
})



router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      if(info.name=='NoSaltValueStoredError'){
        return next('Please login using Google, Facebook, or Twitter')
      } else return res.status(401).json({
        err: info
      });
    }
    console.log(user.isVerified)
    if(!user.isVerified && user.verifyToken){
      return next({message:'Please check your email and verify your account!'})
    }
      var token = authenticate.getToken(user);
        res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
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

router.get('/refresh-token/:id', authenticate.verifyUser, (req, res, next) => {
  var user = req.params.id
  User.find({_id:user}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      var token = authenticate.getToken(users);
        res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,

              // token: token
      });
    }
  })
});

router.post("/setpassword", authenticate.verifyUser, function (req, res,next) {
  User.findOne({ _id: req.body.id }, (err, user) => {
    // Check if error connecting
    if (err) {
      return next(err); // Return error
    } else {
      // Check if user was found in database
      if (!user) {
        return next('User not found')
      } else {
        user.setPassword(
          req.body.newpassword,
          function (err) {
            if (err) {
              if (err.name === "IncorrectPasswordError") {
                return next('Incorrect password'); // Return error
              } else {
                return next("Something went wrong!! Please try again after sometimes.")
              }
            } else {
              user.isSetPassword = true
              user.save().then((set)=>{
                res.json({
                  // success: true,
                  message: "Your password has been set successfully",
                });
              })
            }
          }
        );
      }
    }
  });
});

router.post("/changepassword", authenticate.verifyUser, function (req, res,next) {
  User.findOne({ _id: req.body.id }, (err, user) => {
    // Check if error connecting
    if (err) {
      return next(err); // Return error
    } else {
      // Check if user was found in database
      if (!user) {
        return next('User not found')
      } else {
        user.changePassword(
          req.body.oldpassword,
          req.body.newpassword,
          function (err) {
            if (err) {
              if (err.name === "IncorrectPasswordError") {
                return next('Incorrect password'); // Return error
              } else {
                return next("Something went wrong!! Please try again after sometimes.")
              }
            } else {
              res.json({
                // success: true,
                message: "Your password has been changed successfully",
              });
            }
          }
        );
      }
    }
  });
});

router.get("/auth/verify-email", function (req, res,next) {
  var verifyToken = req.query.token
  User.findOne({ verifyToken: verifyToken },(err,user)=>{
    if(err){
      return next(err)
    }
    if (!user) {
      return res.status(400).json({
        message: 'Token is invalid. Please contact us for assistance.',
      });
    }
    user.verifyToken = null;
    user.isVerified = true;
    user.save().then((set)=>{
      res.status(200).json({
        // success: true,
        message: "Your Account has been verified",
      });
    })
  })
})

module.exports = router;