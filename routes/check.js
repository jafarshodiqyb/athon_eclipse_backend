var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var Check = require('../models/check');
const { findById } = require('../models/user');


var router = express.Router();
router.use(bodyParser.json());

router
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/checkin/:username',authenticate.verifyUser, (req, res, next) => {
    var id = req.params.username
    Check.findOne({username:id}).lean().exec((err,users)=>{
      if (err) {
              return next(err);
            } else {
              res.statusCode = 200;
              res.setHeader('Content_type', 'application/json');
              res.json(users);
            }
          })
    })

router.post('/checkin',authenticate.verifyUser, (req, res, next) => {
        Check.find({})
            .then((check) => {
                var user = check.filter(cek => cek.username.toString() === req.body.username.toString())[0];
                if(!user) {
                    user = new Check({
                        username: req.body.username,
                        lastCheckIn : Date(),
                        lastCheckOut : "",
                        activities:[]
                    });
                }else if(user && moment(user.lastCheckIn).isSame(moment(), 'day')){
                  return next('You have checked in today!');
                } else {
                  user.lastCheckIn = Date()
                }
                user.save()
                    .then((checkStatus) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(checkStatus);
                        console.log("check");
                    }, (err) => next(err))
                    .catch((err) => next(err));
                
            })
            .catch((err) => next(err));
 
});
router.put('/checkout', authenticate.verifyUser, (req, res, next) => {   
  Check.findOne({username:req.body.username}).lean().exec((err,user)=>{
    if(!user.lastCheckOut){
      Check.findOneAndUpdate({username :req.body.username},{lastCheckOut:Date()},(err, updated) =>{
        if (err) {
          return next(err);
        } else{
          res.statusCode = 200;
          res.setHeader('Content_type', 'application/json');
          res.json(updated);
        }  
      })
    } else 
    return next('You have already checkout today!')
  })
            
  
});

router.post('/activity',authenticate.verifyUser, (req, res, next) => {
    Check.findOne({username :req.body.username},(err, user) =>{
      console.log(user)
      if (err) {
        return next(err);
      }  else{
        var activitiesTemp = req.body.activities
        activitiesTemp.createdDate = Date()
        activitiesTemp.assignee = req.body.username
        activitiesTemp.creator = req.body.username
        user.activities = user.activities.concat([activitiesTemp])
        console.log(user.activities)
        // user.activities.push(req.body.activities)
        user.save()
        .then((checkStatus) => {
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(checkStatus);
      }, (err) => next(err))
      .catch((err) => next(err));
      }  
    })

});

router.delete('/activity',authenticate.verifyUser, (req, res, next) => {
  Check.findById(req.body.parentId).then(
    users=>{
       users.activities.id(req.body.childId).remove();
       users.save().then((checkStatus) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(checkStatus);
                    }, (err) => next(err))
                    .catch((err) => next(err));
    }).catch((err) => next(err));

});

router.put('/activity',authenticate.verifyUser, (req, res, next) => {
  Check.findOneAndUpdate(
    { "_id": req.body.parentId, "activities._id": req.body.childId },
    { 
        "$set": {
            "activities.$.activity": req.body.activities.activity
        }
    },
    (err,updatedComment)=>{
      if (err) {
        return next(err);
      } else{
        res.statusCode = 200;
        res.setHeader('Content_type', 'application/json');
        res.json(updatedComment);
      }
    })

});
module.exports = router;