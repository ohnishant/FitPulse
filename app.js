if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();

}
const express = require('express')
const cors = require('cors')


const dbUrl = process.env.DB_URL
const app = express();
const path = require('path')
const ejsMate = require('ejs-mate');
app.use(express.static(path.join(__dirname, 'public')))

const User = require("./models/user")


const bcrypt = require('bcrypt');
const session = require('express-session')
app.use(session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true }));
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    else {
        next();
    }
}
app.use(cors());
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose')
mongoose.connect(dbUrl)
    .then(() => console.log('db connected'))
    .catch((e) => {
        console.log("Mongo Error");
        console.log(e);
    })

app.get('/home', (req, res) => {
    res.render("home")
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get("/excercise", (req, res) => {
    res.render('excercise')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username: username, password: password });
    await user.save()
    req.session.user_id = user._id
    res.redirect('/home')
    // res.send(hashed);
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id
        res.redirect('/home');

    }
    else {
        res.send('Try again')
    }
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})




const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening to port ${PORT}`))