var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var LoginHistory = new Schema({
  username: String,
  // firstName: String,
  // lastName: String,
  lastLogin: Date,
  statusLogin:   {
    type: Boolean,
    default: false
}
});

LoginHistory.plugin(passportLocalMongoose);

module.exports = mongoose.model('LoginHistory', LoginHistory);