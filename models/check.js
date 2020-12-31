var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Check = new Schema({
    username: String,
    lastCheckIn : Date,
    lastCheckOut : Date,
    activities : [{
        activity : String,
        createdDate : Date,
        startDate:Date,
        endDate:Date,
        assignee:String,
        source:   {
            type: String,
            default: 'diarium'
        },
        status:   {
            type: String,
            default: 'todo'
        },
         }]
});


module.exports = mongoose.model('Check', Check);