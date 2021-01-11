var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');

if(process.env.ENV){
  require("dotenv").config({
    path:path.resolve(__dirname, '.env.'+process.env.ENV.trim()),
  });
} else require("dotenv").config()

const formData = require('express-form-data')
const connectDB = require('./config/db');
const connectCloudinary = require('./config/cloudinary');
var index = require('./routes/index');
var users = require('./routes/users');
var check = require('./routes/check');
var stories = require('./routes/stories');
var posts = require('./routes/posts');

connectDB()
connectCloudinary()

var app = express();
app.use(formData.parse())
app.use(cors())
app.set('port', 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// passport config
app.use(passport.initialize());
app.use(passport.session())


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/check', check);
app.use('/stories', stories);
app.use('/posts', posts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;