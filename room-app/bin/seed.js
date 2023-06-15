const mongoose = require("mongoose");
const User = require("../models/User.model");
const Room = require("../models/Room.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const password = ["123", "321", "246"];
const hashedPasswordArray = [];

const hashPasswords = async () => {
  try {
    const generatedSalt = await bcrypt.genSalt(saltRounds);
    for (let i = 0; i < password.length; i++) {
      const hashedPassword = await bcrypt.hash(password[i], generatedSalt);
      hashedPasswordArray.push(hashedPassword);
    }
  } catch {}
};

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/room-app";

hashPasswords().then(() => {
  const exampleUsers = [
    {
      fullname: "Joanne Kuo",
      email: "joannekuo@test.com",
      password: hashedPasswordArray[0],
    },
    {
      fullname: "Jack White",
      email: "jackwhite@test.com",
      password: hashedPasswordArray[1],
    },
    {
      fullname: "Chuck Noris",
      email: "chucknoris@test.com",
      password: hashedPasswordArray[2],
    },
  ];

  const exampleRooms = [
    {
      name: "PenthHouse",
      description: "Very nice house but super expensive",
      imageUrl: "",
      owner: "648b49e9cb7d5b80b1f85145",
    },
    {
      name: "Greate room",
      description: "Super Crappy room",
      imageUrl: "",
      owner: "648b49e9cb7d5b80b1f85145",
    }
  ];

  mongoose
    .connect(MONGO_URI)
    .then((x) => {
      const databaseName = x.connections[0].name;
      console.log(`Connected to Mongo! Database name: "${databaseName}"`);
    })
    // .then(() => User.create(exampleUsers))
    .then(()=> Room.create(exampleRooms))
    .then(() => {
      console.log("Products were added");
      return mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Error connecting to mongo: ", err);
    });
});
