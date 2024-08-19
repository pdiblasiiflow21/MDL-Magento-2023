var express = require('express')
var session = require('express-session')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
require('../models/Store')
require('../models/Notification')
require('../models/Order')
require('../models/Tracking')
require('../models/State')
require('dotenv').config()
// var favicon = require('serve-favicon')
// var package = require('./package.json')

// mongoose instance connection url connection
mongoose.Promise = global.Promise

let mongodb = process.env.DB_NAME
if (process.env.NODE_ENV === 'testing') {
  mongodb = process.env.DB_TESTING_NAME
}

let uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${mongodb}`
if (process.env.MONGO_URI) {
  uri = process.env.MONGO_URI
}

mongoose.connect(uri, {
  useMongoClient: true
})
// Get the default connection
var db = mongoose.connection
// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

var index = require('./routes/index')
var vtexApi = require('./routes/vtexApi')
var magentoApi = require('./routes/magentoApi')

require('./controllers/Cron')

const phrase = 'the phrase for safe cookies'

var app = express()
var sess = {
  secret: phrase,
  cookie: {},
  resave: false,
  saveUninitialized: false
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))
app.use(cookieParser(phrase))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/vtex/notifications/', vtexApi.notifications)
app.use('/vtex/orders/', vtexApi.orders)
app.use('/vtex/stores/', vtexApi.stores)
app.use('/magento/orders/', magentoApi.orders)

app.disable('etag')

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
