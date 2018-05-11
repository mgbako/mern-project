const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = validatePostInput = data => {
  const errors = {};

  data.content = !isEmpty(data.content) ? data.content : "";

  if (validator.isEmpty(data.content)) {
    errors.content = "content is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
