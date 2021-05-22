//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//const secret = process.env.SECRET;

// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ['password']
// });



const User = new mongoose.model("User", userSchema);



app.get('/', (req, res) => {
    res.render("home")
})

app.get('/login', (req, res) => {
    res.render("login")
})
app.post('/login', (req, res) => {
    const username = req.body.username;
    User.findOne({
        email: username
    }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {

                bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
                    // result == true
                    if (result == true) {
                        res.render("secrets");
                    } else {
                        res.render("login");
                    }
                });

            }
        }
    })
})
app.get('/register', (req, res) => {
    res.render("register")
})
app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save((err) => {
            if (err) {
                console.log(err);
            } else {
                res.render("secrets")
            }
        });
    });

});


app.listen(3000, () => {
    console.log("Server started...");
});