var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');

var Stories = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
 },
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
});

Stories.plugin(beautifyUnique)

module.exports = mongoose.model("Stories", Stories);
