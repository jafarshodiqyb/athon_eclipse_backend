var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Check = new Schema({
    username: String,
    lastCheckIn : Date,
    lastCheckOut : Date,
    status:   {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('Check', Check);