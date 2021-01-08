var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var passport = require('passport')
var FacebookStrategy = require('passport-facebook');
var InstagramStrategy = require('passport-instagram').Strategy;

exports.local = passport.use(new LocalStrategy(User.authenticate()));
exports.google = passport.use(
    new GoogleStrategy({
        clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
        clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/users/auth/google/redirect`,
        
    }, async function(accessToken, refreshToken, profile, done) {
        // passport callback function
        //check if user already exists in our db with the given profile ID
        await User.findOne({email: profile.emails[0].value}).then((currentUser)=>{
          if(currentUser){
            //if we already have a record with the given profile ID
            done(null, currentUser);
          } else{
               //if not, create a new user 
              new User({
                username: 'g-'+profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image:profile.photos[0].value,
                address:'',
                motto:'',
                job:'',
                admin:false
              }).save().then((newUser) =>{
                done(null, newUser);
              });
           } 
        })
      })
  );

  
exports.facebook = passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.PASSPORT_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.PASSPORT_FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/users/auth/facebook/redirect`,
      profileFields: ["id", "gender", "profileUrl", "name", "emails", "photos"],
    },
    async function(accessToken, refreshToken, profile, done) {
        // passport callback function
        //check if user already exists in our db with the given profile ID
        await User.findOne({email: profile.emails[0].value}).then((currentUser)=>{
          if(currentUser){
            //if we already have a record with the given profile ID
            done(null, currentUser);
          } else{
               //if not, create a new user 
              new User({
                username: 'fb-'+profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image:profile.photos[0].value,
                address:'',
                motto:'',
                job:'',
                admin:false
              }).save().then((newUser) =>{
                done(null, newUser);
              });
           } 
        })
      })
  );

  exports.instagram = passport.use(
    new InstagramStrategy(
      {
        clientID: process.env.PASSPORT_INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.PASSPORT_INSTAGRAM_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/users/auth/instagram/redirect`,
      },
      async function(accessToken, refreshToken, profile, done) {
          // passport callback function
          //check if user already exists in our db with the given profile ID
          console.log(profile)
          await User.findOne({email: profile.emails[0].value}).then((currentUser)=>{
            if(currentUser){
              //if we already have a record with the given profile ID
              done(null, currentUser);
            } else{
                 //if not, create a new user 
                new User({
                  username: 'ig-'+profile.id,
                  email: profile.emails[0].value,
                  firstName: profile.name.givenName,
                  lastName: profile.name.familyName,
                  image:profile.photos[0].value,
                  address:'',
                  motto:'',
                  job:'',
                  admin:false
                }).save().then((newUser) =>{
                  done(null, newUser);
                });
             } 
          })
        })
    );
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

exports.getToken = function (user) {
    return jwt.sign(user, process.env.MONGO_SECRET_KEY, {
        expiresIn: 3600
    });
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.MONGO_SECRET_KEY;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({
        _id: jwt_payload._id
    }, (err, user) => {
        if (err) {
            return done(err, false);
        } else if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })

}));

exports.verifyUser = function (req, res, next) {
    var auth = req.headers.authorization? req.headers.authorization.substring(7, req.headers.authorization.length):null;
    var token = req.body.token || req.query.token ||  auth ||req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.MONGO_SECRET_KEY, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        var err = new Error('Unauthorized, No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}