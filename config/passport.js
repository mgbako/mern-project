const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const secret = require("../config/keys").secret;

module.exports = passport => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = secret;
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.getUserById(jwt_payload._id)
        .then(user => {
          if (!user) {
            res.json({ message: "User not found" });
          }

          if (user) {
            console.log(user);
            return done(null, user);
          }

          return done(null, false);
        })
        .catch(error => {
          res.json({
            error: error
          });
        });
    })
  );
};
