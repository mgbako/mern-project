const express = require("express");
const router = express.Router();

/**
 * @route GET api/profile/
 * @desc Profile route
 * @access Public
 */

router.get("/", (req, res) => {
  res.json({
    msg: "profile"
  });
});

module.exports = router;
