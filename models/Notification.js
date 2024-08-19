'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var NotificationSchema = new Schema({
  storeId: {
    type: String,
    required: 'Store identifier is required'
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: 'Store not found'
  },
  status: {
    type: String,
    enum: ['pending', 'processed'],
    default: 'pending'
  },
  payload: {
    type: String,
    required: 'JSON Payload is required'
  },
  totalOrders: {
    type: Number
  },
  ordersId: [{
    type: String
  }],
  shipments: [{
    orderId: {
      type: String
    },
    packageId: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Notification', NotificationSchema)
