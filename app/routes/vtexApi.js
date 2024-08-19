'use strict'
var express = require('express')
var auth = require('../auth')
var notificationsController = require('../controllers/Notifications')
var ordersController = require('../controllers/Orders')
var storesController = require('../controllers/Stores')

var notificationsRouter = express.Router()
notificationsRouter.get('/process/', notificationsController.processNotifications)
notificationsRouter.get('/:storeId/', auth.authGuard, notificationsController.list)
notificationsRouter.post('/:storeId/', auth.notificationsGuard, notificationsController.create)
notificationsRouter.post('/create/', auth.notificationsGuard, notificationsController.create)

var ordersRouter = express.Router()
ordersRouter.get('/process/', ordersController.processOrders)
ordersRouter.get('/:storeId/', auth.authGuard, ordersController.list)
// ordersRouter.post('/:storeId/', auth.authGuard, ordersController.vtex.create)

var storesRouter = express.Router()
storesRouter.get('/', auth.authGuard, storesController.list)
storesRouter.post('/', auth.authGuard, storesController.create)

module.exports.notifications = notificationsRouter
module.exports.orders = ordersRouter
module.exports.stores = storesRouter
