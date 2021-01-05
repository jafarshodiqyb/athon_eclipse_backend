var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
exports.google = passport.use(
    new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: `http://localhost:3000/users/auth/google/redirect`,
        
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
                // username: profile.emails[0].value,
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
    return jwt.sign(user, config.mongo.secretKey, {
        expiresIn: 3600
    });
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.mongo.secretKey;

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
        jwt.verify(token, config.mongo.secretKey, function (err, decoded) {
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