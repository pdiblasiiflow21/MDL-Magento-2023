'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var LabelSchema = new Schema({
  url1: {
    type: String
  }
})

var TrackingSchema = new Schema({
  trackingId: {
    type: String,
    required: 'trackingId is required'
  },
  packageId: {
    type: String,
    required: 'packageId is required'
  },
  courierId: {
    type: String,
    required: 'courierId is required'
  },
  storeId: {
    type: String,
    required: 'storeId is required'
  },
  orderId: {
    type: String,
    required: 'orderId is required'
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: 'Order not found'
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  lyraconResponse: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  label: LabelSchema
})

module.exports = mongoose.model('Tracking', TrackingSchema)
