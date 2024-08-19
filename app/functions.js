'use strict'
var config = require('./config')
var axios = require('axios')
var mongoose = require('mongoose')
var Notification = mongoose.model('Notification')
var Store = mongoose.model('Store')
var Order = mongoose.model('Order')
var Tracking = mongoose.model('Tracking')
var State = mongoose.model('State')
var softlightService = require('./services/softlight')
// var fs = require('fs')

var getSingleOrderDetails = async function (storeId, orderId) {
  // let example = JSON.parse(fs.readFileSync('examples/order_detail_response.json'))
  // example.order.orderId = orderId
  // return await new Promise(function (resolve, reject) {
  //     resolve(example)
  // })

  // http://www.vtexcarriers.com/order?courierId=[courierId]&storeId=[storeId]&orderId=[orderId]
  try {
    const store = await getStore(storeId)
    const response = await axios.get(config.vtexCarriers.host + config.vtexCarriers.paths.getOrder, {
      params: {
        courierId: store.courierId,
        storeId: storeId,
        orderId: orderId
      },
      headers: {
        SECURITY_TOKEN: store.authKey
      }
    })
    return response.data
  } catch (error) {
    // console.log(error)
    return error
  }
}

var postTrackingToLyracon = async function (tracking) {
  const store = await getStore(tracking.storeId)

  const payload = {
    storeId: tracking.storeId,
    courierId: tracking.courierId,
    orderId: tracking.orderId,
    packageId: tracking.packageId,
    trackingId: tracking.trackingId,
    trackingURL: config.tracking.host + tracking.trackingId,
    label: {
      url1: tracking.label.url1
    }
    // courierId: tracking.courierId,
  }

  try {
    const response = await axios.post(config.vtexCarriers.host + config.vtexCarriers.paths.createTracking, payload, {
      headers: {
        'Content-Type': 'application/json',
        SECURITY_TOKEN: store.authKey
      }
    })
    return response
  } catch (error) {
    console.log(error.response.config)
    // console.log(error.response.data)
    return error
  }
}

var getStore = async function (storeId) {
  try {
    // Sacar el exec() si es que traba la funcion
    return await Store.findOne({ storeId: storeId }).exec()
  } catch (error) {
    console.log(error)
    throw error
  }
}

// var getStoreToken = async function (storeId) {
//   let token = null
//   try {
//     await Store.findOne({ storeId: storeId }, function (err, result) {
//       if (err) {
//         throw err
//       }
//       token = result.authKey
//     })
//     return token
//   } catch (error) {
//     console.log(error)
//     throw error
//   }
// }

async function mapNotification (notification) {
  let processedCount = 0
  let skippedCount = 0
  let errorsCount = 0
  const apiErrorsCount = 0

  // const counts = {
  //   processedCount: 0,
  //   skippedCount: 0,
  //   errorsCount: 0
  // }
  // loop through Shipments
  const shipments = notification.shipments

  const storeId = notification.storeId
  const store = notification.store
  const notificationId = notification._id

  async function mapShipments (shipment) {
    if (shipment.status === 'pending') {
      const details = await getSingleOrderDetails(storeId, shipment.orderId)
      const data = await getDataFromDetails(details)
      data.storeId = storeId
      data.store = store
      data.notification = notificationId

      var newOrder = new Order(data)
      try {
        await newOrder.save()
        shipment.status = 'processed'
        processedCount++
      } catch (e) {
        errorsCount++
      }
    } else {
      skippedCount++
    }
    return {
      status: shipment.status,
      orderId: shipment.orderId
    }
  }

  const mapPromises = shipments.map(mapShipments)
  // console.log('Waiting on shipment mapPromises:')
  await Promise.all(mapPromises)
  // console.log('all(mapPromises) done:')
  // console.log(mapPromises)

  // if all Shipments processed, set Notification status processed
  if (processedCount + skippedCount === notification.shipments.length) {
    notification.status = 'processed'
  }
  await notification.save()
  return {
    processedCount,
    skippedCount,
    errorsCount,
    apiErrorsCount
  }
}

function reduceResults (message, result) {
  message.notifications++
  message.ordersProcessed += result.processedCount
  message.ordersSkipped += result.skippedCount
  message.ordersErrors += result.errorsCount
  message.ordersApiErrors += result.apiErrorsCount
  return message
}

// VTEX only
exports.processNotifications = async function () {
  var output = {
    message: '',
    err: false
  }

  // console.log('Processing Notifications...')
  // loop through all pending Notifications
  try {
    const notifications = await Notification.find({ status: 'pending' })
    console.log('Found ' + notifications.length.toString() + ' pending Notifications.')

    // console.log('Waiting for Results...')
    const results = await Promise.all(notifications.map(mapNotification))
    // console.log('resolved Results:')

    const initialReduce = {
      notifications: 0,
      ordersProcessed: 0,
      ordersSkipped: 0,
      ordersErrors: 0,
      ordersApiErrors: 0
    }
    output.message = JSON.stringify(results.reduce(reduceResults, initialReduce))
    // console.log('Finished')
    // resolve outer Promise wrapper
  } catch (e) {
    output.err = e
  }
  // console.log('Returning Notifications output')
  // console.log(output)
  return output
}

exports.processTrackings = async function () {
  var output = {
    message: '',
    err: false
  }

  // console.log('Processing Trackings...')
  // loop through all pending Trackings
  try {
    const trackings = await Tracking.find({
      status: 'pending'
    })
    console.log('Found ' + trackings.length.toString() + ' pending trackings.')

    let results = trackings.map(async function (tracking) {
      let processedCount = 0
      const skippedCount = 0
      let errorsCount = 0
      let apiErrorsCount = 0

      const response = await postTrackingToLyracon(tracking)

      // set local Order SoftLight data
      tracking.lyraconResponse = JSON.stringify(response.data)
      if (response.status === 200) {
        // update local Order status
        tracking.status = 'processed'
      } else {
        apiErrorsCount++
        if (response.code === 400) { // Bad request, pointless to repeat attempt.
          // order.status = 'error'
          tracking.status = 'error'
        }
      }
      await new Promise((resolve, reject) => {
        tracking.save(function (err, result) {
          if (err) {
            errorsCount++
            reject(err)
          } else {
            processedCount++
            resolve(result)
          }
        })
      })

      return {
        processedCount,
        skippedCount,
        errorsCount,
        apiErrorsCount
      }
    })
    results = await Promise.all(results)

    output.message = JSON.stringify(results.reduce((message, result) => {
      message.trackings++
      message.trackingsProcessed += result.processedCount
      message.trackingsSkipped += result.skippedCount
      message.trackingsErrors += result.errorsCount
      message.trackingsApiErrors += result.apiErrorsCount
      return message
    }, {
      trackings: 0,
      trackingsProcessed: 0,
      trackingsSkipped: 0,
      trackingsErrors: 0,
      trackingsApiErrors: 0
    }))
  } catch (err) {
    output.err = err
  }
  return output
}
exports.processOrders = async function () {
  var output = {
    message: '',
    err: false
  }

  // loop through all pending Orders
  try {
    const orders = await Order.find({
      status: 'pending',
      platform: 'vtex'
    })
    console.log('Found ' + orders.length.toString() + ' pending Orders.')

    let results = orders.map(async function (order) {
      let processedCount = 0
      const skippedCount = 0
      let errorsCount = 0
      let apiErrorsCount = 0

      const response = await softlightService.postOrderToSoftLight(order)
      // set local Order SoftLight data
      order.softLightResponse = JSON.stringify(response)
      if (response.success) {
        // update local Order status
        order.status = 'processed'

        // create tracking
        const orderStore = await getStore(order.storeId)
        const trackingData = {
          order: order._id,
          packageId: order.packageId,
          orderId: order.orderId,
          trackingId: response.results.tracking_id,
          storeId: order.storeId,
          courierId: orderStore.courierId,
          label: {
            url1: response.results.shippings[0].print_url
          }

        }
        var newTracking = new Tracking(trackingData)
        try {
          await newTracking.save()
        } catch (err) {
          errorsCount++
        }
      } else {
        apiErrorsCount++
        if (response.code === 400) { // Bad request, pointless to repeat attempt.
          order.status = 'error'
        }
      }
      try {
        await order.save()
        processedCount++
      } catch (err) {
        errorsCount++
      }

      return {
        processedCount,
        skippedCount,
        errorsCount,
        apiErrorsCount
      }
    })

    results = await Promise.all(results)

    output.message = JSON.stringify(results.reduce((message, result) => {
      message.orders++
      message.ordersProcessed += result.processedCount
      message.ordersSkipped += result.skippedCount
      message.ordersErrors += result.errorsCount
      message.ordersApiErrors += result.apiErrorsCount
      return message
    }, {
      orders: 0,
      ordersProcessed: 0,
      ordersSkipped: 0,
      ordersErrors: 0,
      ordersApiErrors: 0
    }))
  } catch (err) {
    output.err = err
  }
  return output
}

exports.processMagentoOrder = async function (order, softLightcredentials) {
  // console.log('Entered processMagentoOrder')
  // console.log("REQUEST: ", order)
  const response = await softlightService.postOrderToSoftLight(order, softLightcredentials)
  // set local Order SoftLight data
  order.softLightResponse = JSON.stringify(response)
  // update local Order status
  if (response.success) {
    order.status = 'processed'
  } else {
    order.status = 'error'
  }
  // console.log('Process Magento Order Response')
  // console.log('RESPONSE FROM SOFTLIGHT', response)
  await new Promise((resolve, reject) => {
    order.save(function (err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
  return response
}

exports.processRate = async function (data, softLightcredentials) {
  // console.log('Entered processRate')
  const response = await softlightService.postRateToSoftLight(data, softLightcredentials)
  // set local Order SoftLight data
  return response
}

exports.mapMagentoOrder = function (body) {
  const data = {
    orderId: body.orderId,
    packageId: body.packageId,
    lastname: body.lastname,
    name: body.name,
    email: body.email,
    phone: body.phone,
    address: {
      street: body.address.street,
      number: body.address.number,
      addressComplement: body.address.addressComplement,
      postalCode: body.address.postalCode,
      city: body.address.city,
      state: body.address.state,
      receiverName: body.address.receiverName,
      comments: body.address.comments
    }
  }
  data.items = body.items.map(item => {
    return {
      productId: item.productId,
      name: item.name,
      weight: item.weight,
      height: item.height,
      width: item.width,
      length: item.length,
      quantity: item.quantity,
      price: item.price
    }
  })
  return data
}

var getDataFromDetails = async function (details) {
  const data = {
    platform: 'vtex',
    // storeId: null,
    // notification: null,
    orderId: details.order.orderId,
    packageId: details.order.packageId,
    name: details.order.name,
    lastname: details.order.lastname,
    documentType: details.order.documentType,
    document: details.order.document,
    email: details.order.email,
    phone: details.order.phone,
    address: {
      street: details.order.address.street,
      number: details.order.address.number,
      addressComplement: details.order.address.addressComplement,
      postalCode: details.order.address.postalCode,
      city: details.order.address.city,
      state: details.order.address.state,
      receiverName: details.order.address.receiverName,
      comments: details.order.address.comments,
      dockId: details.order.address.dockId
    },
    courierName: details.order.courierName,
    branchId: details.order.branchId,
    branchName: details.order.branchName,
    branchAddress: details.order.branchAddress,
    value: details.order.value,
    tax: details.order.tax,
    startDateUtc: details.order.startDateUtc,
    endDateUtc: details.order.endDateUtc
  }
  data.items = details.items.map(item => {
    return {
      productId: item.productId,
      name: item.name,
      cubicWeight: item.cubicWeight,
      weight: item.weight,
      height: item.height,
      width: item.width,
      length: item.length || item.lenght,
      quantity: item.quantity,
      price: item.price,
      tax: item.tax
    }
  })

  await mapStateFromLyraconsToSoftlight(data)

  return data
}

var mapStateFromLyraconsToSoftlight = async function (data) {
  const softlightState = await State.findOne({ stateLyracons: data.address.state.toLowerCase() })
  data.address.state = softlightState.stateSoftlight
}
