const express = require('express') // Aplicacion web
const session = require('express-session') // Middleware para sesiones
const passport = require('passport') // Autenticacion
const path = require('path') // Gestion de paths


const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const GOOGLE_CLIENT_ID = '212108694115-j6afrr08rui0rkmlgc02e0q3bnj3jhf2.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

const port = 3000

const app = express()

// Configuracion de la aplicacion
//app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(session({resave: false, saveUninitialized: true, secret: 'SECRET' })) // Utilizamos el Middleware para las sesiones
app.set('views', path.join(__dirname, '/views')) // Path de la carpeta views
app.set('view engine', 'ejs') // Establecemos el engine de renderizado

app.use(passport.initialize()) // Inicializamos passport
app.use(passport.session())
passport.serializeUser((user, done) => done(null, user)) // Guardamos la información del usuario en la sesion
passport.deserializeUser((user, done) => done(null, user)) // Eliminamos la información del usuario de la sesion


// Solo para testing
let userProfile 

// Google OAuth
passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhos:3000/auth/google/callback",
  passReqToCallback   : true
},
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      userProfile = profile;
        return done(null, userProfile);
    })
  }
))

// Rutas
app.get('/', (req, res) => {
    // let file = path.join(__dirname, 'public', 'index.html')
    // res.sendFile(file)

    res.render('pages/auth');
})

app.get('/login/success', (req, res) => res.send(userProfile))
app.get('/login/error', (req, res) => res.send("Error logging in"))

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))
app.get('/auth/google/callback', passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}))

// 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})