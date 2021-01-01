const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDb = require('./config/db');
const app = express();

// config .env to ./config/env
require('dotenv').config({
  path: './config/config.env',
});

// connect to database
connectDb();

// use body parser
app.use(bodyParser.json());

// config for only development
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
    })
  );

  app.use(morgan('dev'));

  // Morgan give informations about each requrest
  // Cors it's allow to deal with client app for same host without any problem
}

const PORT = process.env.PORT;

// Load all route
const apiRoute = require('./routes/apiRoutes');
app.use('/api', apiRoute);

app.use((req, res, next) => {
  res.status(401).json({
    success: false,
    message: 'Page Not Founded.',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
