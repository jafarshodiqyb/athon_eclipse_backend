const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

// Create a user schema

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  try {
    const user = this;
    if (!user.isModified) {
      return next();
    }

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password, callback) {
  const user = this;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

module.exports = mongoose.model('user', userSchema);
