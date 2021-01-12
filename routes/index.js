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
  
  cloudinary.v2.uploader.upload(path,
    { responsive_breakpoints: { 
      create_derived: true, bytes_step: 20000, min_width: 200, max_width: 750, 
      transformation: { crop: 'fill', aspect_ratio: '16:9', gravity: 'auto' } },
      quality:75,
      width:500 })
    .then(image => {
      console.log(image)
      res.json([image])
    })
})
module.exports = router;
