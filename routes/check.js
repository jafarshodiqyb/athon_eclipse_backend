var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var User = require('../models/user');
var passport = require('passport');
const checkHistory = require('../models/check-history');
var authenticate = require('../authenticate');
var Check = require('../models/check');


var router = express.Router();
router.use(bodyParser.json());

router.get('/checkin/:id',authenticate.verifyUser, (req, res, next) => {
    var id = req.params.id
    Check.findOne({username:id}).populate('username').lean().exec((err,users)=>{
      if (err || users==null|| users==[]) {
              return next(err);
            } else {
              res.statusCode = 200;
              res.setHeader('Content_type', 'application/json');
              res.json(users);
            }
          })
    })

router.post('/checkin',authenticate.verifyUser, (req, res, next) => {
        Check.find({}).populate("user")
            .then((check) => {
              console.log()
                var user = check.filter(cek => cek.username.toString() === req.body.id.toString())[0];
                var checkInHistory;
                if(!user) {
                    user = new Check({
                        username: req.body.id,
                        lastCheckIn : Date(),
                        lastCheckOut : "",
                        activities:[]
                    });
                    // user.user.push(req.body.username)
                    

              }else if(user && moment(user.lastCheckIn).isSame(moment(), 'day')){
                  return next('You have checked in today!');
                } else {
                  user.lastCheckIn = Date()
                  // checkInHistory.lastCheckIn = Date()
                }
                checkInHistory = new checkHistory({
                  username: req.body.id,
                  lastCheckIn : Date(),
                  lastCheckOut : "",
                })
                user.save()
                    .then((checkStatus) => {

                      
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(checkStatus);
                    }, (err) => next(err)).then(
                      (result=>{

                        checkInHistory.save().then((checkInHistoryStatus)=>{
                          res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(checkInHistoryStatus);
                        }), (err) => next(err)
                      })
                    )
                    .catch((err) => next(err));
                
            })
            .catch((err) => next(err));
 
});
router.put('/checkout', authenticate.verifyUser, (req, res, next) => {   
  Check.findOne({username:req.body.id}).lean().exec((err,user)=>{
    if(!user.lastCheckOut || !moment(user.lastCheckOut).isSame(moment(), 'day')){
      Check.findOneAndUpdate({username :req.body.id},{lastCheckOut:Date()},{new:true},(err, updatedCheckout) =>{
        if (err) {
          return next(err);
        } else{
          //find checkoutHistory
          const today = moment().startOf('day')
          checkHistory.findOneAndUpdate({username:req.body.id,  lastCheckIn : {$gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()} } ,{lastCheckOut:Date()},(err,updated)=>{
              
              res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(updatedCheckout);
          })
        }  
      })
    } else 
    return next('You have already checkout today!')
  })
            
  
});

router.post('/activity',authenticate.verifyUser, (req, res, next) => {
    Check.findOne({username :req.body.username},(err, user) =>{
      if (err) {
        return next(err);
      }  else{
        var activitiesTemp = req.body.activities
        activitiesTemp.createdDate = Date()
        activitiesTemp.assignee = req.body.username
        activitiesTemp.creator = req.body.username
        user.activities = user.activities.concat([activitiesTemp])
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
          "activities.$.status": req.body.activities.status,
          "activities.$.activity": req.body.activities.activity
        },
        
    },
    {new: true},
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