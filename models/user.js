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
    admin:   {
        type: Boolean,
        default: false
    }
},{strict:false});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);