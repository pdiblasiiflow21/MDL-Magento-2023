'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var StateSchema = new Schema({
  stateLyracons: {
    type: String,
    required: 'Lyracons State not found'
  },
  stateSoftlight: {
    type: String,
    required: 'Softlight State not found'
  }
})

module.exports = mongoose.model('State', StateSchema)
