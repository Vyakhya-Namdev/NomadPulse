const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../authentication.js");
const { signup, renderSignupForm, login, renderLoginForm, logout } = require("../controllers/user.js");

router.route("/signup")
      .get(renderSignupForm)
      .post(wrapAsync(signup));

router.route("/login")
      .get(renderLoginForm)
      .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), login);
        //failureFlash -> to display a flash message if user not authenticate
        //failureRedirect -> fail to authenticate user

router.get("/logout", logout);

module.exports = router;