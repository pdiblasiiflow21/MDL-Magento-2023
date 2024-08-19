'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var AddressSchema = new Schema({
  street: {
    type: String
  },
  number: {
    type: String
  },
  addressComplement: {
    type: String
  },
  postalCode: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  receiverName: {
    type: String
  },
  comments: {
    type: String
  },
  dockId: {
    type: String
  }
})
var ItemSchema = new Schema({
  productId: {
    type: String
  },
  name: {
    type: String
  },
  cubicWeight: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  width: {
    type: Number
  },
  length: {
    type: Number
  },
  quantity: {
    type: Number
  },
  price: {
    type: Number
  },
  tax: {
    type: Number
  }
})
var OrderSchema = new Schema({
  storeId: {
    type: String,
    required: 'Store identifier is required'
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: 'Store not found'
  },
  platform: {
    type: String,
    enum: ['vtex', 'magento'],
    default: 'vtex'
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  notification: {
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  },
  orderId: {
    type: String
  },
  packageId: {
    type: String
  },
  lastname: {
    type: String
  },
  name: {
    type: String
  },
  documentType: {
    type: String
  },
  document: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  address: AddressSchema,
  courierName: {
    type: String
  },
  branchId: {
    type: String
  },
  branchName: {
    type: String
  },
  branchAddress: {
    type: String
  },
  value: {
    type: Number
  },
  tax: {
    type: Number
  },
  startDateUtc: {
    type: Date
  },
  endDateUtc: {
    type: Date
  },
  items: [ItemSchema],
  softLightResponse: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Order', OrderSchema)
