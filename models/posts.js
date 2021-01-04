const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Posts = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
 },
  image: String,
  lastUpdate: Date,
  posts: 
    {
      createdDate: Date,
      content:String,
      image:String,
    },
});
module.exports = mongoose.model('Posts', Posts);