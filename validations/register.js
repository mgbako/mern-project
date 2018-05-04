const validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = validateRegisterInput = data => {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!validator.isLength(data.name, { min: 2 })) {
    errors.name = "Name character must be greater than 2";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name field is Required";
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "Not a valid email Address";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is Required";
  }

  if (!validator.isLength(data.password, { min: 6 })) {
    errors.password = "Password character must be greater than 6";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is Required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
