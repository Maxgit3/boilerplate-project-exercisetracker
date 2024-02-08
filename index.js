const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
require("dotenv").config();

const mySecret = process.env['MONGO_URI'];
const client = new mongodb.MongoClient(mySecret);
const database = client.db("exercise_tracker");
const users = database.collection("users");


app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let resUser, resId
app.route("/api/users").post(async (req, res) => {
  resUser = req.body.username
  let user1 = await users.insertOne({ username: resUser });
  resId = user1.insertedId;
  
  res.json({ username: resUser, _id: resId });
}).get((req, res) => {
  res.json({username: resUser, _id: resId});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
