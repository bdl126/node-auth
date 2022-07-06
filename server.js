require('dotenv').config()
const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const {Strategy} = require('passport-google-oauth20')
const cookieSession = require('cookie-session')

const PORT = 3000

const config = {
    CLIENT_ID : process.env.CLIENT_ID,
    CLIENT_SECRET : process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
}


const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
}

function verifyCallback(accessToken, refreshToken, profile, done) {
    // console.log('google profile:', profile);
    console.log("verify callback");
    done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

//save the session to the cookie
passport.serializeUser((user, done) => {
    console.log("serialize :", user.id);
    done(null, user.id)
})

// read the session from the cookie
passport.deserializeUser((id, done) => {
    console.log("deserialize : ", id);
    done(null, id)
})

const app = express()

app.use(helmet())

app.use(cookieSession({
    name: 'session',
    maxAge: 24* 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}))

app.use(passport.initialize())
app.use(passport.session())

function checkLoggedIn(req,res,next) {
    const isLoggedin = req.isAuthenticated() && req.user
    console.log('check login');
    if(!isLoggedin)
    {
        return res.status(401).json({
            error: "you msut log in"
        })
    }
    next();
}

app.get('/auth/google',  passport.authenticate('google', {
    scope: ['email']
}), (req,res) => {
    console.log('path /auth/google');
})

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        // successRedirect: "/",
        session: true
    }),
    (req, res) => {
        console.log('google called us back');
        res.redirect('/');
    }
)

app.get('/failure', (req,res) => {
    return res.send("failed to log in!")
})

app.get('/auth/logout', (req,res) => {
    req.logout();
    return  res.redirect('/');
})

app.use(express.static(path.join(__dirname, "index", "index.html")))

app.get('/secret', checkLoggedIn,  (req,res) => {
    console.log('looking at the secret');
    return res.send("it's a secret")
})

app.get('/*', (req,res) => {
    return res.sendFile(path.join(__dirname, "index", "index.html"))
})

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
},app)

server.listen(PORT, () => {
    console.log(`Server on on ${PORT}`);
})