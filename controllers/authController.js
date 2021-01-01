const User = require('./../models/user');
const { validationResult } = require('express-validator');
const { sendEmail } = require('./../helpers/mail');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);

    const error = errors
      .array()
      .map((error) => ({ message: error.msg, param: error.param }))[0];

    if (!errors.isEmpty()) {
      return res.status(400).json(error);
    }

    const { username, firstName, lastName, password } = req.body;

    let user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({
        message:
          'An account with that email address already exists. Please login to continue.',
      });
    }
    newUser = new User({
      username,
      firstName,
      lastName,
      password,
      verifyToken: crypto.randomBytes(64).toString('hex'),
    });
    await newUser.save();
    await sendEmail(newUser, req.headers.host);
    return res.json(newUser);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: 'Internal server errors.' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const verifyToken = req.query.token;
    const user = await User.findOne({ verifyToken: verifyToken });
    if (!user) {
      return res.status(400).json({
        message: 'Token is invalid. Please contact us for assistance.',
      });
    }
    user.verifyToken = null;
    user.isVerified = true;
    await user.save();
    return res.json({ message: 'User verify' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
