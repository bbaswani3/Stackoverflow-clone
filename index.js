const port = process.env.PORT || 3000;
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
var err = "fail";

//All route
const auth= require('./routes/api/auth');
const question= require('./routes/api/questions');
const profile= require('./routes/api/profile');

const app = express();

//middleware for bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//mongo config
const db=require('./setup/myurl').mongoURL

mongoose
    .connect(db)
    .then(()=>console.log('MongoDB connected successfully'))
    .catch(()=>console.log(err));
//passport middleware
app.use(passport.initialize());

//config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);


// testing route
app.get("/", (req,res)=>{
    res.send("hey there big stack");
});

//actual route
app.use("/api/auth", auth);
app.use("/api/question", question);
app.use("/api/profile", profile);

app.listen(port, ()=>console.log(`App is running at ${port}`));