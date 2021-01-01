const { check } = require('express-validator');

exports.validSign = [
  check('username').not().isEmpty().withMessage('Username is required'),
  check('firstName').not().isEmpty().withMessage('First name is required'),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required.')
    .isLength({
      min: 6,
      max: 16,
    })
    .withMessage('Password must be between 6 to 16 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number.'),
];
