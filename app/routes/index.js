'use strict'
var express = require('express')
var auth = require('../auth')
var mongoose = require('mongoose')
var Store = mongoose.model('Store')
var Notification = mongoose.model('Notification')
var Order = mongoose.model('Order')

var router = express.Router()

const returnOk = function (req, res) {
  return res.send('OK')
}
router.get('/health', returnOk)

/* GET home page. */
router.get('/', auth.authGuard, function (req, res, next) {
  let stores, notifications, orders
  const sQuery = Store.find({}).populate('notifications orders trackings')
  sQuery.exec(function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    stores = result
  })
  const nQuery = Notification.find({})
  nQuery.exec(function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    notifications = result
  })
  const oQuery = Order.find({})
  oQuery.exec(function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    orders = result
  })

  Promise.all([sQuery, nQuery, oQuery]).then(values => {
    res.render('index', {
      title: 'iFlow',
      stores: stores,
      notifications: notifications,
      orders: orders
    })
  })
})

/* GET login page. */
router.get('/login', function (req, res, next) {
  if (req.session.loggedIn) {
    return res.redirect('/')
  } else {
    res.render('login')
  }
})
router.post('/login', function (req, res, next) {
  if (req.body.token === process.env.AUTH_CARD_IFLOW) {
    req.session.loggedIn = true
    return res.redirect('/')
  } else {
    res.render('login')
  }
})

/* GET reset db */
router.get('/reset/:target', auth.authGuard, function (req, res, next) {
  const target = req.params.target
  let valid = false
  if (target === 'notifications' || target === 'all') {
    valid = true
    Notification.remove({}, function (err, result) {
      if (err) {
        return res.status(500).send(err)
      }
    })
  }
  if (target === 'orders' || target === 'all') {
    valid = true
    Order.remove({}, function (err, result) {
      if (err) {
        return res.status(500).send(err)
      }
    })
  }
  if (!valid) {
    return res.send('Invalid target.')
  }
  res.send('reset ' + target)
})

module.exports = router
