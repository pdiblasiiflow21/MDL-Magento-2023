'use strict'
var functions = require('../functions')
var CronJob = require('cron').CronJob

console.log('Setting up Cron')
// new CronJob('0 */5 * * * *', function () {
/*eslint-disable */
new CronJob('0 */5 * * * *', function () { 
  console.log('Running Cron') 
  functions.processNotifications()
  functions.processOrders() 
  functions.processTrackings()
}, null, true, '') 
/* eslint-enable */
