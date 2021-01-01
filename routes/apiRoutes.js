const express = require('express');
const router = express.Router();

const { register } = require('./../controllers/authController');
const { validSign } = require('./../helpers/validation');

router.post('/auth/register', [validSign], register);

module.exports = router;
