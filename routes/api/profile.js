const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validations/profile");
const validateExperienceInput = require("../../validations/experience");
const validateEducationInput = require("../../validations/education");

/**
 * @route GET api/profile/all
 * @desc Get all profile
 * @access Public
 */

router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = "There are no profiles";
        return res.status(404).json(errors);
      }
      return res.status(200).json(profiles);
    })
    .catch(err => res.status(404).json(err));
});

/**
 * @route POST api/profile/
 * @desc Create New Profile
 * @access Private
 */

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills !== "undefind") {
      profileFields.skills = req.body.skills.split(",");
    }

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

/**
 * @route GET api/profile/:handle
 * @desc Get current user profile
 * @access Public
 */

router.get("/:handle", (req, res) => {
  const errors = {};
  console.log("User", req.user);
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      return res.status(200).json(profile);
    })
    .catch(err => res.status(404).json(err));
});

/**
 * @route DELETE api/profile/:handle
 * @desc Add education to profile
 * @access Private
 */

router.delete(
  "/:handle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => {
          res.json({ profile: "Profile Deleted" });
        })
        .catch(error => res.json(error));
    });
  }
);

/**
 * @route GET api/profile/user/:user_id
 * @desc Get current user profile by user id
 * @access Public
 */

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  console.log("User", req.user);
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      return res.status(200).json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

/**
 * @route POST api/profile/experience
 * @desc Add experience to profile
 * @access Private
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        enddate: req.body.enddate,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(error => res.status(400).json(error));
    });
  }
);

/**
 * @route DELETE api/profile/experience/:exp_id
 * @desc Delete experience from profile
 * @access Private
 */
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Get experience to remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out (Remove) of array
      profile.experience.splice(removeIndex, 1);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(error => res.status(400).json(error));
    });
  }
);

/**
 * @route POST api/profile/education
 * @desc Add education to profile
 * @access Private
 */
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        enddate: req.body.enddate,
        current: req.body.current,
        description: req.body.description
      };

      profile.education.unshift(newEducation);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(error => res.status(400).json(error));
    });
  }
);

/**
 * @route DELETE api/profile/education/:edu_id
 * @desc Delete education from profile
 * @access Private
 */
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Get education to remove index

      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // Splice out (Remove) of array
      profile.education.splice(removeIndex, 1);
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(error => res.status(400).json(error));
    });
  }
);

module.exports = router;
