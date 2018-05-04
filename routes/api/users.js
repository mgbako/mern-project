const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
const User = require("../../models/User");
const secretKey = require("../../config/keys").secret;

const validateRegisterInput = require("../../validations/register");
const validateLoginInput = require("../../validations/login");

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
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    res.status(400).json({
      error: errors
    });
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
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
        const newUser = new User({
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
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    res.status(400).json({
      error: errors
    });
  }

  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email).then(user => {
    if (!user) {
      errors.email = "User not found";
      res.json(errors);
    }

    User.comparePassword(password, user.password).then(isMatch => {
      console.log(isMatch);
      if (!isMatch) {
        errors.password = "Wrong Password";
        res.status(400).json(errors);
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

/**
 * @route POST api/users/current
 * @desc Return current User
 * @access Private
 */

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  }
);

module.exports = router;
