var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CheckHistory = new Schema({
    username: String,
    lastCheckIn : Date,
    lastCheckOut : Date,
});


module.exports = mongoose.model('CheckHistory', CheckHistory);