'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var StoreSchema = new Schema({
  name: {
    type: String
  },
  storeId: {
    type: String,
    required: 'Store identifier is required'
  },
  authKey: {
    type: String
  },
  courierId: {
    type: String,
    required: 'Courier Id is required'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
// }, {toObject: {virtuals: true}})

StoreSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'store',
  justOne: false
})
StoreSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'store',
  justOne: false
})

StoreSchema.virtual('trackings', {
  ref: 'Tracking',
  localField: 'storeId',
  foreignField: 'storeId',
  justOne: false
})

// StoreSchema.methods.findNotifications = function (cb) {
//     let query = this.model('Notification').find({
//         store: this._id
//     })
//     query.exec(cb)
//     return query
// }

// StoreSchema.methods.findOrders = function (cb) {
//     return this.model('Order').find({
//         store: this._id
//     }, cb)
// }

module.exports = mongoose.model('Store', StoreSchema)
