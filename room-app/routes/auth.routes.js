//import express and setup router
const express = require("express");
const router = express.Router();

//import bcrypt and setup salt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//import User data model
const User = require("../models/User.model");
const Room = require("../models/Room.model");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard");

//import passport and passport-local package
const passport = require("passport");
const localStrategy = require("passport-local");

router.get("/", (req, res, next) => {
  if (req.session.currentUser) {
    return res.render("index", { loggedIn: true });
  } else {
    return res.render("index", { loggedIn: false });
  }
});

router.get("/login", isLoggedOut, (req, res, next) => {
  if (req.session.currentUser) {
    return res.render("./auth-views/login", { loggedIn: true });
  } else {
    return res.render("./auth-views/login", { loggedIn: false });
  }
});

router.post("/login", isLoggedOut, async (req, res, next) => {
  const { fullname, password } = req.body;
  if (!fullname || !password) {
    res.render("/login", {
      errorMessage: "Please enter both, username and password to login.",
    });
  }

  const foundUser = await User.findOne({ fullname });

  if (!foundUser) {
    res.render("/login");
  } else if (bcrypt.compareSync(password, foundUser.password)) {
    const { fullname, email, _id } = foundUser;
    req.session.currentUser = { fullname, email, _id };
    console.log(
      "req.session.current information ====>",
      req.session.currentUser
    );
    res.redirect("/login");
  } else {
    res.render("/login", { errorMessage: "Incorrect password." });
  }
});

router.get("/sign-up", isLoggedOut, (req, res, next) => {
  if (req.session.currentUser) {
    res.render("./auth-views/sign-up");
  } else {
    res.render("./auth-views/sign-up");
  }
});

router.post("/sign-up", isLoggedOut, async (req, res, next) => {
  const { fullname, email, password } = req.body;

  try {
    const foundUser = await User.findOne({ fullname: fullname });
    if (foundUser) {
      res.render("./auth-views/sign-up", {
        errorMessage: "Username has been taken, use another one",
      });
    } else {
      const generatedSalt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, generatedSalt);
      const createdUser = await User.create({
        fullname: fullname,
        email: email,
        password: hashedPassword,
      });

      console.log(createdUser);

      const { fullname, email, _id } = createdUser;
      req.session.currentUser = { fullname, email, _id };
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
  }
});

router.post("/logout",isLoggedIn, (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
  console.log(req.session);
});

module.exports = router;
