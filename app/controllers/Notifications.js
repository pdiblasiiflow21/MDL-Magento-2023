'use strict'
var functions = require('../functions')
var mongoose = require('mongoose')
var Notification = mongoose.model('Notification')
var Store = mongoose.model('Store')

exports.list = function (req, res) {
  Notification.find({
    storeId: req.params.storeId
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.create = function (req, res) {
  // diagnostic request, return code 200
  // {"storeId":"-1","totalOrders":-1,"ordersId":["-1"]}
  console.log(req.body)
  if (req.body.storeId === '-1' && req.body.totalOrders === -1) {
    console.log('Diagnostics OK')
    return res.status(200).send('Diagnostics OK')
  }

  try {
    var data = {
      storeId: req.body.storeId,
      totalOrders: req.body.totalOrders,
      ordersId: req.body.ordersId,
      shipments: req.body.shipments || req.body.Shipments,
      payload: JSON.stringify(req.body)
    }
  } catch (err) {
    // console.log(err)
    return res.status(500).send('Invalid data input')
  }

  Store.findOne({
    storeId: data.storeId
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    if (!result) {
      return res.status(500).send('Invalid Store')
    }

    data.store = result._id

    var newNotification = new Notification(data)
    newNotification.save(function (err, result) {
      if (err) { res.send(err) }
      res.json(result)
    })
  })
}

exports.read = function (req, res) {
  Notification.findById(req.params.notificationId, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.update = function (req, res) {
  Notification.findOneAndUpdate({
    _id: req.params.notificationId
  }, req.body, {
    new: true
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.delete = function (req, res) {
  Notification.remove({
    _id: req.params.notificationId
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({
      message: 'Notification successfully deleted'
    })
  })
}

exports.processNotifications = function (req, res) {
  functions.processNotifications()
    .then(result => {
      if (result.err) {
        return res.status(500).send(result.err)
      }
      res.json(result)
    }, result => {
      if (result.err) {
        return res.status(500).send(result.err)
      }
    })
}
