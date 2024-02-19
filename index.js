const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
require("dotenv").config();

const mySecret = process.env['MONGO_URI'];
const client = new mongodb.MongoClient(mySecret);
const database = client.db("exercise_tracker");
const users = database.collection("users");
const exercises = database.collection("exercises");


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
  
  // res.json({ username: resUser, _id: resId });
  res.redirect("/api/user")
}).get(async (req, res) => {
  let reqUsers = await users.find({}).toArray()
  res.json(reqUsers);
});

app.get("/api/user", (req, res) => {
  res.json({username: resUser, _id: resId});
})

// exercises
let reqId, reqDesc, reqDur, reqDate, userDoc;

app.post(
  "/api/users/:_id/exercises", async (req, res) => {
    reqId = req.params._id
    reqDesc = req.body.description;
    reqDur = req.body.duration;  
    reqDate = req.body.date;

    userDoc = await users.findOne({ _id: new mongodb.ObjectId(reqId) });
    console.log(userDoc)
   let exercise = await exercises.insertOne({
        user_id: userDoc._id,
        description: reqDesc,
        duration: reqDur,  
        date: reqDate ? new Date(reqDate) : new Date()
    });
    console.log(exercise.insertedId.toString());  
    // res.json({
    //   username: userDoc.username,
    //   description: reqDesc,
    //   duration: reqDur,
    //   date: new Date(reqDate).toDateString(),
    //   _id: userDoc._id.toString()
    // });
    res.redirect("/api/user/exercise")
  })

app.get("/api/user/exercise", async (req, res) => {
    let userObject = {
      username: userDoc.username,
      description: reqDesc,
      duration: +reqDur,
      date: new Date(reqDate).toDateString(),
      _id: userDoc._id
    };
  console.log(userObject)
    // res.json({
    //   username: userDoc.username,
    //   description: reqDesc,
    //   duration: reqDur,
    //   date: new Date(reqDate).toDateString(),
    //   _id: userDoc._id.toString()
    // });
    res.json(userObject);
})

app.get("/api/users/:_id/logs", async (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  let userId = req.params._id;

  let userObj = await users.findOne({ _id: new mongodb.ObjectId(userId) });
  
  let dateObj = {};
  if (from) {
    dateObj["$gte"] = new Date(from);
  }
  if (to) {
    dateObj["$lte"] = new Date(to);
  }

  let filter = {
    user_id: new mongodb.ObjectId(userId)
  }

  if (from || to) {
    filter.date = dateObj;
  }
  let userExercises = await exercises.find(filter).limit(+limit ?? 500).toArray();

  res.json({
    username: userObj.username,
    count: userExercises.length,
    _id: userObj._id,
    log: userExercises.map(exer => ({
      description: exer.description,
      duration: +exer.duration,
      date: exer.date.toDateString()
    }))
  });
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
