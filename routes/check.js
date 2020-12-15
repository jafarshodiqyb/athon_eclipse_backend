var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var Check = require('../models/check');


var router = express.Router();
router.use(bodyParser.json());

router.get('/checkin', authenticate.verifyUser, (req, res, next) => {
  Check.find({}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content_type', 'application/json');
      res.json(users);
    }
  })
});

router
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/checkin/:id',authenticate.verifyUser, (req, res, next) => {
    var id = req.params.id
    Check.findById(id)
        .then((check) => {
            console.log(check)
        })
        .catch((err) => next(err));
})
router.post('/checkin',authenticate.verifyUser, (req, res, next) => {
        Check.find({})
            .then((check) => {
                var user;
                if(!user) {
                    user = new Check({
                        username: req.body.username,
                        lastCheckIn : Date(),
                        lastCheckOut : "",
                    });
                }
                console.log(user)
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

router.put('/checkin/:id', authenticate.verifyUser, (req, res, next) => {
    var id = req.params.id
    Check.find({}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content_type', 'application/json');
      res.json(users);
    }
  })
});

module.exports = router;