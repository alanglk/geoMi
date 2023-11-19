const express = require('express'),         // Aplicacion web
      session = require('express-session'), // Middleware para sesiones
      passport = require('passport'),       // Autenticacion
      path = require('path'),               // Gestion de paths
      cors = require('cors'),               // Habilitar CORS
      bodyParser = require('body-parser'),  // Permitir headers application/json
      prometheus = require('prom-client')   // Metricas de Prometheus

const { getLocationsOfUser, addNewLocationToUser, addNewUser } = require('./database')
const { getGeocodingOfLocation } = require('./geomiapi')


const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const GOOGLE_CLIENT_ID = '212108694115-j6afrr08rui0rkmlgc02e0q3bnj3jhf2.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

const register = new prometheus.Registry()      // Para enviar datos de monitorizacion
prometheus.collectDefaultMetrics({ register })  // Habilitamos las metricas default

const port = 3000
const app = express()


// Configuracion de la aplicacion
app.use( cors() )                                                             // Habilitamos CORS
app.use(bodyParser.json());                                                   // Para permitir headers application/json
app.use("/static", express.static(path.join(__dirname, "public")) )           // Establecemos los archivos estáticos
app.use(session({
  resave: false, 
  saveUninitialized: true, 
  secret: 'SECRET', 
  cookie: { secure: false, maxAge: 900000 }
}))                                                                           // Utilizamos el Middleware para las sesiones (15 min duracion de cookie)
app.set('views', path.join(__dirname, '/views'))                              // Path de la carpeta views
app.set('view engine', 'ejs')                                                 // Establecemos el engine de renderizado

app.use(passport.initialize())                                                // Inicializamos passport
app.use(passport.session())
passport.serializeUser((user, done) => done(null, user))                      // Guardamos la información del usuario en la sesion
passport.deserializeUser((user, done) => done(null, user))                    // Eliminamos la información del usuario de la sesion


// Google OAuth
passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/google/callback",
  passReqToCallback   : true
},
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile)
  }
))

// Rutas
app.get('/', async (req, res) => {
    console.log(req.session)
    
    let locals
    if (req.session.auth){
      locals = await getLocationsOfUser(req.session.user.id)
      // locals = await getLocationsOfUser(1)
      console.log(locals)
    }

    res.render('pages/index', { auth: req.session.auth, user: req.session.user, locals: locals})

})

app.get('/login', (req, res) => {
  if (req.session.auth){
    console.log(`Ya estas logeado como ${req.session.user.nombre}`)
    res.redirect("/")
  }else res.render('pages/login')
})

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)

    res.redirect('/')
  })
})

app.post('/localize', async (req, res) => {
  if (!req.session.auth) res.send('Tienes que estar loggeado')
  else{
    console.log("LOCALIZE!!!")
    console.log(`id: ${req.session.user.id} la: ${req.body.latitude} lo: ${req.body.longitude}`)

    await addNewLocationToUser(req.session.user.id, req.body.latitude, req.body.longitude)

    res.send('OK!! Recarga la pagina para ver la nueva localización.')
  }
})

app.post('/geocoding', async (req, res) => {
  // Nos comunicamos con la api (que no se muestra directamente al usuario)
  // Es enrebesado hacerlo así, pero la idea es que el cliente no acceda
  // directamente a la api, si no que sea la aplicación web.
  console.log(req.body)
  
  if (!req.session.auth) res.send('Tienes que estar loggeado')
  else{
    const lat = req.body.latitude
    const lon = req.body.longitude

    res.send(await getGeocodingOfLocation(lat, lon))
  }
})

// Endpoint para métricas de Prometheus
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType)
  const metrics = await register.metrics()
  
  console.log("Enviando metricas a Prometheus")
  //console.log(metrics)
  res.send(metrics)
})

// Solo está implementado el login con Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))
app.get('/auth/google/callback', passport.authenticate( 'google', {
  successRedirect: '/auth/google/success',
  failureRedirect: '/auth/google/failure'
}))
app.get('/auth/google/success', (req, res) => {
  // Indicamos que el usuario se ha autenticado
  if (req.session.auth)res.redirect('/')

  else if (req.user != null){
    const id =      req.user.id
    const nombre =  req.user.given_name
    const email =   req.user.email

    req.session.auth = true
    req.session.user = { id: id, nombre: nombre, email: email}
    addNewUser(id, nombre, email)

    res.redirect('/')
  } 

  else res.send(`No se ha iniciado sesión`)
  
})
app.get('/auth/google/error', (req, res) => res.send("Error logging in"))

// 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})