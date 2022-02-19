const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const mykey = require('../../setup/myurl');

// for bcrypt
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

router.get('/',(req,res)=> res.json({test: "auth is being tested"}));

// Import schema to Register
const Person = require('../../models/Person');
const { location } = require("express/lib/response");
const { json } = require("body-parser");

//@type POST
//@route /api/auth/register
//@desc Route for registration of users
//@access PUBLIC

router.post('/register', (req,res)=>{
    Person.findOne({ email: req.body.email})
    .then( (person) =>{
        if (person) {
            return res.status(400).json({emailerror:'Email is already registered in our system'})

        } else{
            const newPerson = new Person({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
            });
            // Encrypt password using bcrypt
            bcrypt.genSalt(saltRounds, (err, salt)=> {
                bcrypt.hash(newPerson.password, salt, (err, hash)=> {
                    if(err) throw err;
                    newPerson.password = hash;
                    newPerson
                    .save()
                    .then(person=>res.json(person))
                    .catch(err => console.log(err)); 
                });
            });
        }
    })
    .catch(err => console.log(err));
});


//@type POST
//@route /api/auth/login
//@desc Route for registration of users
//@access PUBLIC

router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    Person.findOne({ email })
      .then(person => {
        if (!person) {
          return res
            .status(404)
            .json({ emailerror: "User not found with this email" });
        }
        bcrypt
          .compare(password, person.password)
          .then(isCorrect => {
            if (isCorrect) {
              // res.json({ success: "User is able to login successfully" });
              //use payload and create token for user
              const payload = {
                id: person.id,
                name: person.name,
                email: person.email
              };
              jsonwt.sign(
                payload,
                mykey.secret,
                { expiresIn: 3600 },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                }
              );
            } else {
              res.status(400).json({ passworderror: "Password is not correct" });
            }
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });
//@type GET
//@route /api/auth/profile
//@desc Route for user profile
//@access PRIVATE


router.get('/profile',passport.authenticate('jwt',{session: false}),
(req,res)=>{
    res.json({
        id: req.user.id,
        name:req.user.name,
        email:req.user.email,
        rofilepic:req.user.profilepic
    });

})

module.exports = router;