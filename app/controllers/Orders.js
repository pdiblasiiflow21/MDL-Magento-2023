'use strict'
var functions = require('../functions')
var mongoose = require('mongoose')
var Order = mongoose.model('Order')
var Store = mongoose.model('Store')

exports.list = function (req, res) {
  Order.find({ storeId: req.params.storeId }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.read = function (req, res) {
  Order.findById(req.params.orderId, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json(result)
  })
}

exports.update = function (req, res) {
  Order.findOneAndUpdate({
    _id: req.params.orderId
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
  Order.remove({
    _id: req.params.orderId
  }, function (err, result) {
    if (err) {
      return res.status(500).send(err)
    }
    res.json({
      message: 'Order successfully deleted'
    })
  })
}

exports.processOrders = function (req, res) {
  functions.processOrders()
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

exports.getRate = async function (req, res) {
  // console.log(req.body)
  const data = req.body

  var softLightcredentials = {
    softLightUser: data.softLightUser,
    softlightPassword: data.softlightPassword

  }
  // console.log('Credentials', softLightcredentials)
  // Synch SL shipment creation
  try {
    // console.log('Get rate before post')
    const softLightResponse = await functions.processRate(data, softLightcredentials)

    // console.log('Softlight response')
    // console.log(softLightResponse)
    if (softLightResponse.code === 401) {
      return res.status(401).send('Invalid Credentials')
    }
    if (softLightResponse.code === 400) {
      return res.status(400).send(softLightResponse.errors)
    }
    return res.json(softLightResponse)
  } catch (error) {
    // console.log('Error 5')
    // console.log(error)
    return res.status(500).send(error)
  }
}

exports.vtex = {
  create: function (req, res) {
    return res.status(403).send('Direct access to this action is disabled.')
  }
}

exports.magento = {
  create: function (req, res) {
    try {
      // console.log('Request body')
      // console.log(req.body)
      var data = {
        storeId: req.params.storeId,
        platform: 'magento',
        softLightUser: req.body.softlightUser,
        softlightPassword: req.body.softlightPassword,
        // payload: JSON.stringify(req.body),
        ...functions.mapMagentoOrder(req.body)
      }
    } catch (err) {
      console.log('Error 1')
      return res.status(500).send('Invalid data input')
    }

    Store.findOne({ storeId: data.storeId }, function (err, result) {
      if (err) {
        console.log('Error 2')
        return res.status(500).send(err)
      }
      if (!result) {
        console.log('Error 3')
        return res.status(404).send('Invalid identifier')
      }
      data.store = result._id
      var softLightcredentials = {
        softLightUser: data.softLightUser,
        softlightPassword: data.softlightPassword
      }
      var newOrder = new Order(data)
      newOrder.save(async function (err, result) {
        if (err) {
          console.log('Error 4')
          return res.status(500).send(err)
        }

        // Synch SL shipment creation
        try {
          // console.log('ORDER MAPPED')
          // console.log(softLightcredentials)
          // console.log('Order payload before post')
          const softLightResponse = await functions.processMagentoOrder(result, softLightcredentials)
          // console.log('Softlight response')
          // console.log(softLightResponse)
          if (softLightResponse.code === 401) {
            return res.status(401).send('Invalid Credentials')
          }
          if (softLightResponse.code === 400) {
            return res.status(400).send(softLightResponse.errors)
          }
          return res.json(softLightResponse)
        } catch (error) {
          console.log('Error 5')
          return res.status(500).send(error)
        }
        // return tracking and label URL from SL response

        // Magento module expects:
        // "code": 201,
        // "success": true,
        // "message": "Se ha creado con éxito la Orden #1230",
        // "results": {
        //     "tracking_id": "OR0000971841",
        //     "order_id": "1230",
        //     "shippings": [
        //         {
        //             "order_id": "1230",
        //             "shipment_id": "T00000000098",
        //             "print_url": "http://test-api.iflow21.com/api/order/print/436364/T00000000098.pdf"
        //         }
        //     ]
        // }
      })
    })
  }
}
