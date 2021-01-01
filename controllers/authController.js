const User = require('./../models/user');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);

    const error = errors
      .array()
      .map((error) => ({ message: error.msg, param: error.param }))[0];
    console.log(error);

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
    });

    await newUser.save();

    return res.json(newUser);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: 'Internal server errors.' });
  }
};
