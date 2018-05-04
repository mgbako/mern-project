const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();
const Users = require("../../models/User");
const secretKey = require("../../config/keys").secret;

/**
 * @route GET api/users/
 * @desc Users route
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    msg: "users"
  });
});

/**
 * @route POST api/users/register
 * @desc Register user
 * @access Public
 */
router.post("/register", (req, res) => {
  Users.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({
        email: "Email already exists"
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          res.status(500).json({
            error: err
          });
        }
        const newUser = new Users({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: hash
        });

        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    }
  });
});

/**
 * @route POST api/users/signin
 * @desc Login User
 * @access Public
 */
router.post("/signin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email).then(user => {
    if (!user) {
      res.json({
        message: "User not found"
      });
    }

    User.comparePassword(password, user.password).then(isMatch => {
      console.log(isMatch);
      if (!isMatch) {
        res.status(400).json({ message: "Wrong Password" });
      }
      const token = jwt.sign(user.toJSON(), secretKey, {
        expiresIn: 604800
      });

      res.json({
        token: "Bearer " + token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    });
  });
});

module.exports = router;
