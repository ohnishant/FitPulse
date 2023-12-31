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




const bcrypt = require('bcrypt');
const session = require('express-session')

const User = require("./models/user")
const Feed = require('./models/feed');


const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    else {
        next();
    }
}
app.use(session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true }));
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



app.get('/addpost', requireLogin, async (req, res) => {
    const user = await User.findById(req.session.user_id);
    if (!user) {
        res.render('login')
    }
    else {
        res.render('addpost')
    }

})


app.get('/calculators', (req, res) => {
    res.render("calculator");
})

app.post('/addpost', requireLogin, async (req, res) => {

    const { posttext } = req.body;
    const id = req.session.user_id;
    if (!id) {
        res.redirect('/login');
    }
    else {
        const foundUser = await User.findById(id);
        const username = foundUser.username;
        const newpost = Feed({
            name: username,
            post: posttext
        });


        await newpost.save();
        res.redirect('/feed');
    }
    // console.log(req.session.user_id)

    // await Feed.insertOne({post:posttext});
    // res.red
})

app.get('/feed', requireLogin, async (req, res) => {
    const allFeed1 = await Feed.find({});
    const allFeed = allFeed1.reverse();
    res.render("feed", { allFeed });
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
        res.redirect('/feed');

    }
    else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})




const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening to port ${PORT}`))