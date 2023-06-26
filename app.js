//jshint esversion:6
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> console.log("Connection successfull...."))
.catch((err) => console.log(err));

const userSchema = new mongoose.Schema ({
email :{
    type: String,
    required: true,
    unique:true,
    lowercase:true,
    trim:true
  } ,
  password: {
    type: String,
    required: true
  }
});

//const secret = "SOME_LONG_UNGUESSABLE_STRING"

userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});

//collection creation
const User = new mongoose.model("User", userSchema);

 app.get("/", function(req,res){
   res.render("home");
 });

 app.get("/login", function(req,res){
   res.render("login");
 });

 app.get("/register", function(req,res){
   res.render("register");
 });

app.post("/register",(req,res) => {
    const newUser = new User({
      email : req.body.username,
      password: req.body.password
    });

    //During save(), documents are encrypted using the secret key behind the scenes.
   //and this will add a _ac and _ct field replacing the field to which we are applying
   //encryption to.
    newUser.save()
    .then(function(){
      res.render("secrets");
    })
    .catch(function(err){
      console.log(err);
    })
});

app.post("/login",function(req,res){
   const username = req.body.username;
   const password =req.body.password;
   //During find(), documents are decrypted behind the scenes.
      //the _ct field is deciphered and individual fields are inserted back
      //into the document as their original data types.
   User.findOne({email: username})
   .then(function(foundUser){
     if(foundUser.password ===password){
       res.render("secrets");
     }
   })
   .catch(function(err){
     console.log(err);
   })
} )

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
