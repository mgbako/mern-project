const express = require("express");
const router = express.Router();

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

module.exports = router;
