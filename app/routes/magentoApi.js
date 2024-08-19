'use strict'
var express = require('express')
var auth = require('../auth')
var ordersController = require('../controllers/Orders')
// var notificationsController = require('../controllers/Notifications')
// var storesController = require('../controllers/Stores')

var ordersRouter = express.Router()
ordersRouter.get('/process/', ordersController.processOrders)
ordersRouter.post('/getrate/', ordersController.getRate)
ordersRouter.get('/:storeId/', auth.authGuard, ordersController.list)
ordersRouter.post('/:storeId/create', ordersController.magento.create)

module.exports.orders = ordersRouter
