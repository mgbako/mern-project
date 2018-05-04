const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = (module.exports = mongoose.model("users", UserSchema));

module.exports.getUserById = id => {
  return User.findById(id).exec();
};

module.exports.getUserByEmail = email => {
  const query = { email: email };
  return User.findOne(query).exec();
};

module.exports.comparePassword = (candidatePassword, hash) => {
  return bcrypt.compare(candidatePassword, hash);
};
