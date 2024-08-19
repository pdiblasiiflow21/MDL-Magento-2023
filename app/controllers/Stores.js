'use strict'
var mongoose = require('mongoose')
var Store = mongoose.model('Store')

exports.list = function (req, res) {
  Store.find({}, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.create = function (req, res) {
  var data = req.body
  var newStore = new Store(data)
  newStore.save(function (err, result) {
    if (err) { res.send(err) }
    res.json(result)
  })
}

exports.read = function (req, res) {
  Store.findById(req.params.storeId, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.update = function (req, res) {
  Store.findOneAndUpdate({
    _id: req.params.storeId
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
  Store.remove({
    _id: req.params.storeId
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({
      message: 'Store successfully deleted'
    })
  })
}
