var axios = require('axios')
var config = require('../config')

const postOrderToSoftLight = async function (order, softLightcredentials) {
  const payload = getSoftLightPayloadFromOrder(order)
  try {
    const token = await getSoftLightToken(softLightcredentials)
    const response = await axios.post(config.softLight.host + config.softLight.paths.createOrder, payload, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  } catch (error) {
    console.log(error)
    console.log('Error funcion postOrderToSoftLight DATA')
    console.log(error.response.data)

    return error.response.data
  }
}

const postRateToSoftLight = async function (order, softLightcredentials) {
  try {
    const token = await getSoftLightToken(softLightcredentials)
    const response = await axios.post(config.softLight.host + config.softLight.paths.getRate, order, {
      // baseUrl: config.softLight.host,
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  } catch (error) {
    console.log('Error funcion postRateToSoftLight')
    console.log('Error funcion postRateToSoftLight DATA')
    console.log(error.response.data)

    return error.response.data
  }
}

var getSoftLightToken = async function (softLightcredentials) {
  // attempt to get token from cache?
  const payload = {
    _username: softLightcredentials ? softLightcredentials.softLightUser : config.softLight.user,
    _password: softLightcredentials ? softLightcredentials.softlightPassword : config.softLight.pass
  }
  // console.log('API Credentials:')
  // console.log(payload)
  try {
    const response = await axios.post(config.softLight.host + config.softLight.paths.login, payload)
    if (response.data.success) {
      // store token in cache?
      // console.log('Received token ' + response.data.token)
      return response.data.token
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

var getSoftLightPayloadFromOrder = function (order) {
  const data = {
    order_id: order.orderId,
    shipments: [],
    receiver: {
      first_name: order.name,
      last_name: order.lastname,
      receiver_name: order.address.receiverName,
      receiver_phone: order.phone,
      email: order.email || 'n@a.com',
      address: {
        street_name: order.address.street,
        street_number: order.address.number.substr(0, 18),
        between_1: order.address.addressComplement || 'n/a', // check
        between_2: 'n/a', // check
        other_info: order.address.comments,
        neighborhood_name: order.address.city,
        zip_code: order.address.postalCode,
        city: order.address.city,
        state: order.address.state
      }
    }
  }
  data.shipments.push(order.items.reduce((shipment, item) => {
    item.length = item.length || 1
    shipment.items_value += item.price
    // shipment.shipping_cost
    shipment.weight += item.weight
    shipment.width = Math.max(shipment.width, item.width)
    shipment.height = Math.max(shipment.height, item.height)
    shipment.length = Math.max(shipment.length, item.length)
    shipment.items.push({
      item: item.name,
      sku: item.productId || 'n/a',
      quantity: item.quantity
    })
    return shipment
  }, {
    items_value: 0,
    // "shipping_cost": 0,
    width: 1,
    height: 1,
    length: 0,
    weight: 0,
    items: []
  }))

  return data
}

module.exports = {
  postRateToSoftLight: postRateToSoftLight,
  postOrderToSoftLight: postOrderToSoftLight
}

// const postRateToSoftLightFake = async () => {
//   return ''
// }

// const postOrderToSoftLightFake = async () => {
//   return ''
// }

// if (process.env.NODE_ENV === 'testing') {
//   module.exports = {
//     postRateToSoftLight: postRateToSoftLightFake,
//     postOrderToSoftLight: postOrderToSoftLightFake
//   }
// } else {
// module.exports = {
//   postRateToSoftLight: postRateToSoftLight,
//   postOrderToSoftLight: postOrderToSoftLight
// }
// }
