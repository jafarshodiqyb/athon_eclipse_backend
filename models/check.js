var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Check = new Schema({
    username: String,
    lastCheckIn : Date,
    lastCheckOut : Date,
    activities : [{
        activity : String,
        description:String,
        // subactivty:[],
        createdDate : Date,
        startDate:Date,
        endDate:Date,
        assignee:String,
        creator:String,
         }]
});


module.exports = mongoose.model('Check', Check);