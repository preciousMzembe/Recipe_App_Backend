const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const axios = require('axios');
const API_KEY = 'e697d764a7e84806b773c64f0b9fec65 ';
const jwt = require('jsonwebtoken')
const secretKey = 'yumyumtoken';
const mongoose = require('mongoose')
const User = require('./models/user')

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(morgan('dev'))

const dbURI = "mongodb+srv://precious:precious@cluster0.x9xxr.mongodb.net/recipe?retryWrites=true&w=majority"
mongoose.connect(dbURI)
    .then((result) => app.listen(3001))
    .catch((err) => console.log(err))

// register user
app.post("/register", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const user = new User({
        username: username,
        password: password
    })

    User.findOne({ username: username })
        .then((result) => {
            if (result != null) {
                res.status(404).send("Username already used")
            } else {
                user.save()
                    .then((result) => {
                        const user = {
                            id: result._id,
                            username: result.username
                        };
                        const token = jwt.sign(user, secretKey);
                        res.json({ token });
                    })
            }
        })
})

// login
app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({ username: username, password: password })
        .then((result) => {
            if (result == null) {
                res.status(404).send("User not found")
            } else {
                const user = {
                    id: result._id,
                    username: result.username
                };
                const token = jwt.sign(user, secretKey);
                res.json({ token });
            }
        })
        .catch((err) => console.log(err))
})

// authentication
app.post("/authenticate", (req, res) => {
    const token = req.body.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;
    const username = decoded.username;

    User.findOne({ _id: userId, username: username })
        .then((result) => {
            if (result === null) {
                res.status(404).send("User not found")
            } else {
                const user = {
                    id: result._id,
                    username: result.username
                };
                res.json({ user })
            }
        })
})

// get recipes
app.post("/recipes", async (req, res) => {
    let data = []
    await axios.get(`https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=1`)
        // axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=pasta&number=10`)
        .then(res => {
            // console.log(res.data.recipes);
            data = res.data.recipes
        })
        .catch(error => {
            console.log(error);
        });

    // console.log(data)
    data.forEach((element) => {
        console.log(element.title);
      });
    res.json(data)
})