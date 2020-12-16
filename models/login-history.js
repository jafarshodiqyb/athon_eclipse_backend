var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var LoginHistory = new Schema({
    username: String,
    lastLogin : Date
});

LoginHistory.plugin(passportLocalMongoose);

module.exports = mongoose.model('LoginHistory', LoginHistory);