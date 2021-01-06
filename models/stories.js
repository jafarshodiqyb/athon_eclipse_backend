var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");
const beautifyUnique = require('mongoose-beautiful-unique-validation');

var Stories = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
 },
  image : String,
  lastUpdate:Date,
  stories: [{
    url: String,
    duration: Number,
    storiesDate:Date,
    header: {
      heading: String,
      subheading: String,
      profileImage: String,
    }
  }],
}, { strict: false });

Stories.plugin(passportLocalMongoose);
Stories.plugin(beautifyUnique)

module.exports = mongoose.model("Stories", Stories);
