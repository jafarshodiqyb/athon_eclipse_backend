var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
const cloudinary = require('cloudinary')

/* GET home page. */
router.get('/', authenticate.verifyUser,function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/image-upload', (req, res) => {

  const path = req.files.file.path
  
  cloudinary.uploader.upload(path)
    .then(image => res.json([image]))
})
module.exports = router;
