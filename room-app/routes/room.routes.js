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

router.get("/rooms", async (req, res, next) => {
  try {
    const allRooms = await Room.find();
    console.log(allRooms);
    if (req.session.currentUser) {
      return res.render("./room-views/rooms", { allRooms, loggedIn: true });
    } else {
      return res.render("./room-views/rooms", { allRooms, loggedIn: false });
    }
  } catch (err) {
    console(err);
  }
});

router.post("/new-room", isLoggedIn, async (req, res, next) => {
  const { name, description, imageUrl } = req.body;
  try {
    const createdRoom = await Room.create({
      name,
      description,
      imageUrl,
      owner: req.session.currentUser._id,
    });
    res.redirect("/rooms");
  } catch (err) {
    console.log(err);
  }
});

//get route for seeing room detail
router.get("/rooms/:roomId", async (req, res, next) => {
  const foundRoom = await Room.findById(req.params.roomId);

  if (!req.session.currentUser) {
    return res.render("./room-views/room-detail", {
      foundRoom,
      ownUser: false,
      loggedIn: false,
    });
  }

  if (req.session.currentUser._id === foundRoom.owner.toString()) {
    return res.render("./room-views/room-detail", {
      foundRoom,
      ownUser: true,
      loggedIn: true,
    });
  } else {
    return res.render("./room-views/room-detail", {
      foundRoom,
      ownUser: false,
      loggedIn: true,
    });
  }
});

//post route for updating room detail
router.post("/rooms/:roomId/edit", isLoggedIn, async (req, res, next) => {
  const { name, description, imageUrl } = req.body;
  try {
    const editedUser = await Room.findByIdAndUpdate(
      req.params.roomId,
      {
        name,
        description,
        imageUrl,
      },
      { new: true }
    );
    res.redirect(`/rooms/${editedUser._id}`);
  } catch (err) {
    console.log(err);
  }
});

router.post("/rooms/:roomId/delete", isLoggedIn, async (req, res, next) => {
  try {
    const removedRoom = await Room.findByIdAndRemove(req.params.roomId);
    res.redirect("/rooms");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
