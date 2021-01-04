var express = require("express");
var router = express.Router();
var authenticate = require("../authenticate");
const cloudinary = require("cloudinary");
var Posts = require("../models/posts");

router.get('/', authenticate.verifyUser, (req, res, next) => {
    Posts.find()
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
      })
      
  });

router.post("/", authenticate.verifyUser, (req, res, next) => {
        post = new Posts({
          user: req.body.user,
          image: req.body.image,
          lastUpdate: Date(),
          posts: 
            {
              createdDate: Date(),
              content:req.body.posts.content,
              image:req.body.posts.image,
            },
          
        });
     
      post.save().then(
        (savedPosts) => {
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(savedPosts);
        },
        (err) => next(err)
      );
    })
module.exports = router;
