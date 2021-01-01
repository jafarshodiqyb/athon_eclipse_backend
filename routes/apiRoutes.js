const express = require('express');
const router = express.Router();

const { register, verifyToken } = require('./../controllers/authController');
const { validSign } = require('./../helpers/validation');

router.post('/auth/register', [validSign], register);
router.get('/auth/verify-email', verifyToken);
module.exports = router;
