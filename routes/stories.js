var express = require("express");
var router = express.Router();
var authenticate = require("../authenticate");
const cloudinary = require("cloudinary");
var Stories = require("../models/stories");

router.get("/", authenticate.verifyUser, (req, res, next) => {
  Stories.find({})
  .sort({ lastUpdate: "desc" })
  .populate("user")
  .lean()
  .exec((err, users) => {
      if (err) {
        return next(err);
      } else {
        res.statusCode = 200;
        res.setHeader("Content_type", "application/json");
        res.json(users);
      }
    });
});
router.post("/", authenticate.verifyUser, (req, res, next) => {
  Stories.findOneAndUpdate({'user' : req.body.user},{lastUpdate:Date(),$push:{'stories':req.body.stories}},(err,story) => {
      console.log(story)
        // var story = stories.filter( (cek) => cek.user.toString() === req.body.user.toString())[0];
        // var user = check.filter(cek => cek.user.toString() === req.body.user.toString())[0];
      
        if (!story) {
        story = new Stories({
          user: req.body.user,
          lastUpdate: Date(),
          stories: [
            req.body.stories
          ],
        });
      } 
      console.log(story)
      story.save().then(
        (savedStories) => {
          savedStories.populate("user").execPopulate().then((reso,err)=>{
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(reso);
          })
        },
        (err) => next(err)
      );
    })
});
module.exports = router;
