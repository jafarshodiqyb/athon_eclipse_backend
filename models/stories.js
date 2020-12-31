var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var Stories = new Schema({
  username: String,
  image : String,
  lastUpdate:Date,
  stories: [{
    url: String,
    duration: Number,
    header: {
      heading: String,
      subheading: String,
      profileImage: String,
    }
  }],
}, { strict: false });

Stories.plugin(passportLocalMongoose);

module.exports = mongoose.model("Stories", Stories);
