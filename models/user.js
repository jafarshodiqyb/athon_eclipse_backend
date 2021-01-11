var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type:String,
        unique:true
    },
    firstName: String,
    lastName:String,
    email:String,
    job:String,
    password: String,
    image:String,
    address:String,
    motto:String,
    verifyToken:{
        type:String,
        default:null
    },
    isVerified : {
        type:Boolean,
        default:false,
    },
    isSetPassword:{
        type:Boolean,
        default:false
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose,{usernameQueryFields: ["username","email"],usernameField : "email"});

module.exports = mongoose.model('User', User);