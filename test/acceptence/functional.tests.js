const request = require('supertest')
const app = require('../../app')
const expect = require('chai').expect
const config = require('../../app/config')
const nock = require('nock')
const nockData = require('./nockData')
const mongoose = require('mongoose')
const exampleOrder = require('../../examples/order_detail_response.json')
const exampleNotification = require('../../examples/notification_post.json')
const exampleGetRate = require('../../examples/get_rate_request.json')
const realNotificationExample = require('../../examples/real_notifications_sample.json')
const Store = require('../../models/Store')
const Tracking = require('../../models/Tracking')
const Order = require('../../models/Order')
const Notification = require('../../models/Notification')
const State = require('../../models/State')
const appFunctions = require('../../app/functions')

describe('API TESTS', () => {
  describe('GET Connection', () => {
    it('respond with 200', (done) => {
      request(app).get('/health').expect('OK', done)
    })
  })
})

describe('Functional Tests', () => {
  before(() => {
    // GetSoftLightToken
    nock(config.softLight.host)
      .post(uri => uri.includes(config.softLight.paths.login))
      .reply(200, nockData.sampleResponseGetSoftLightToken)
      .persist()
    // SoftligthCrateOrder
    nock(config.softLight.host)
      .post(uri => uri.includes(config.softLight.paths.createOrder))
      .reply(200, nockData.sampleResponseSoftligthCrateOrder)
      .persist()
    // postRateToSoftLight
    nock(config.softLight.host)
      .post(uri => uri.includes(config.softLight.paths.getRate))
      .reply(200, nockData.sampleResponsePostRateToSoftLight)
      .persist()
    // GetSingleOrderDetails
    nock(config.vtexCarriers.host)
      .get(uri => uri.includes(config.vtexCarriers.paths.getOrder))
      .reply(200, function (uri) {
        const id = this.req.options.search.split('&')[2].split('=')[1]
        return nockData.sampleResponseGetSingleOrderDetails(id)
      })
      .persist()
    // PostTrackingToLyracon
    nock(config.vtexCarriers.host)
      .post(uri => uri.includes(config.vtexCarriers.paths.createTracking))
      .reply(200, nockData.sampleResponsePostTrackingToLyracon)
      .persist()
  })

  const storeId = exampleNotification.storeId
  beforeEach('Create registers Collections', async () => {
    await Store.create({ storeId: storeId, courierId: '1', authKey: 'auth123' })
    await State.create({ stateLyracons: 'Ciudad Autónoma de Buenos Aires', stateSoftlight: 'CAPITAL FEDERAL' },
      { stateLyracons: 'Buenos Aires', stateSoftlight: 'CAPITAL FEDERAL' },
      { stateLyracons: 'ciudad autónoma de buenos aires', stateSoftlight: 'CAPITAL FEDERAL' })
  })

  afterEach('Clean Collections', async () => {
    async function clearCollections () {
      for (var collection in mongoose.connection.collections) {
        await mongoose.connection.collections[collection].remove({})
      }
    }
    return await clearCollections()
  })

  describe('Magento Api Tests', () => {
    describe('Order Test', () => {
      describe('POST create an order for store by StoreId', () => {
        it('should create an order for store successfully', async () => {
          const req = exampleOrder.order
          req.items = exampleOrder.items
          const response = await request(app).post('/magento/orders/' + exampleNotification.storeId + '/create')
            .send(req)
          expect(response.status).to.equal(200)
        })
      })

      describe('POST Get Rate of an Order', () => {
        it('should get rates of an Order successfully', (done) => {
          request(app).post('/magento/orders/getrate/')
            .send(exampleGetRate)
            .expect(response => {
              expect(response.body.results.final_value).to.be.an('number')
            })
            .end(done)
        })
      })
    })
  })

  describe('VTex Api Tests', () => {
    describe('Notifications Test', () => {
      describe('Create a Notification Diagnostic OK', () => {
        it('should recive an "Diagnostic OK"', (done) => {
          const req = { storeId: '-1', totalOrders: -1 }
          request(app).post('/vtex/notifications/create/')
            .send(req)
            .expect(res => {
              expect(res.text).to.eq('Diagnostics OK')
              expect(res.statusCode).to.eq(200)
            })
            .end(done)
        })
      })
      describe('POST Create a Notification Manually', () => {
        it('should create a notification with a store and 3 orders associated', async () => {
          const res = await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)

          expect(res.statusCode).to.eq(200)
        })
        it('should found one notifications status "pending"', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)

          const notifications = await Notification.find({ status: 'pending' }).count()
          expect(notifications).to.eq(1)
        })
      })

      describe('GET all Processed Notifications', () => {
        beforeEach('Create registers Collections', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })

        it('should procces the notification with status "process"', async () => {
          const res = await request(app).get('/vtex/notifications/process/')
          expect(res.statusCode).to.be.eq(200)
        })
        it('should found one notifications status "processed"', async () => {
          await request(app).get('/vtex/notifications/process/')

          const notifications = await Notification.find({ status: 'processed' }).count()
          expect(notifications).to.eq(1)
        })
        it('should be found 3 orders with status "pending" and plataform "vtex"', async () => {
          await request(app).get('/vtex/notifications/process/')

          const orders = await Order.find({ status: 'pending', platform: 'vtex' }).count()
          expect(orders).to.be.eq(3)
        })
      })

      describe('Correct process of creating notifications/orders', () => {
        beforeEach('Create registers Collections', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })

        it('should Found 2 notifications "pending" and Found 6 orders "pending" and create its', async () => {
          await request(app).get('/vtex/notifications/process/')

          const ordersCount = await Order.count()
          expect(ordersCount).to.be.eq(6)
        })
      })

      describe('GET all notifications from a store Id', () => {
        it.skip('should list the six notifications created previously', (done) => {
          request(app).get('/vtex/notifications/' + storeId + '/')
            .expect(res => {
              expect(res.statusCode).to.be.eq(200)
            })
            .end(done)
        })
      })

      describe('POST Create a Notification for a Store', () => {
        it.skip('should list the six notifications created previously', (done) => {
          request(app).post('/vtex/notifications/' + storeId + '/')
            .expect(res => {
              expect(res.statusCode).to.be.eq(200)
            })
            .end(done)
        })
      })
    })

    describe('Orders Test', () => {
      describe('GET Process Order ', () => {
        beforeEach('Create registers Collections', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).get('/vtex/notifications/process/')
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })
        it('should receive an output order when get /process/', async () => {
          const res = await request(app).get('/vtex/orders/process/')
          expect(res.statusCode).to.equal(200)
        })
        it('should be 3 orders with status "process"', async () => {
          await request(app).get('/vtex/orders/process/')
          const ordersCount = await Order.find({ status: 'processed', platform: 'vtex' }).count()
          expect(ordersCount).to.be.eq(3)
        })
        it('should create 3 Trakings with status "pending"', async () => {
          await request(app).get('/vtex/orders/process/')
          const trackings = await Tracking.find({ status: 'pending' }).count()
          expect(trackings).to.be.eq(3)
        })
      })
    })
    describe.only('Tracking Test', () => {
      beforeEach('Create registers Collections', async () => {
        await request(app).post('/vtex/notifications/create/')
          .send(exampleNotification)
        await request(app).get('/vtex/notifications/process/')
        await request(app).get('/vtex/orders/process/')
      })

      afterEach('Clean Collections', async () => {
        async function clearCollections () {
          for (var collection in mongoose.connection.collections) {
            await mongoose.connection.collections[collection].remove({})
          }
        }
        return await clearCollections()
      })
      it('should return an output with no errors', async () => {
        const res = await appFunctions.processTrackings()
        expect(res.err).to.be.eq(false)
      })
      it('should be 3 trakings with status "processed"', async () => {
        await appFunctions.processTrackings()
        const trackings = await Tracking.find({ status: 'processed' }).count()
        expect(trackings).to.be.eq(3)
      })
    })

    describe('State Test', () => {
      beforeEach('Create registers Collections', async () => {
        await request(app).post('/vtex/notifications/create/')
          .send(exampleNotification)
      })

      afterEach('Clean Collections', async () => {
        async function clearCollections () {
          for (var collection in mongoose.connection.collections) {
            await mongoose.connection.collections[collection].remove({})
          }
        }
        return await clearCollections()
      })

      it('should be 3 ordes with a correct state value', async () => {
        await request(app).get('/vtex/notifications/process/')
        const order = await Order.find({ 'address.state': 'CAPITAL FEDERAL' }).count()

        expect(order).to.be.eq(3)
      })
    })

    describe.skip('Cron Test', () => {
      describe('Notification status flow ', () => {
        const notificationExample =
        {
          storeId: '5b69f773e4b0b7fef343c636',
          totalOrders: 1,
          ordersId: [
            '1058712992863-01'
          ],
          Shipments: [{
            orderId: '1058712992863-01',
            packageId: '1'
          }
          ]
        }
        beforeEach('Create registers Collections', async () => {
          await Store.create({
            storeId: '5b69f773e4b0b7fef343c636',
            courierId: 'LYRACONS-IFLOW-DELIVERY',
            authKey: '4d6rtfguijd6rtfguhjierctvyin'
          })
          await request(app).post('/vtex/notifications/create/')
            .send(notificationExample)
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })

        it('should find 1 notifications by store Id with Status Pending', async () => {
          const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
          expect(notifications).to.be.eq(1)
        })
        it('should process 1 notifications and set its in Status Processed', async () => {
          await request(app).get('/vtex/notifications/process/')
          const notifications = await Notification.find({ storeId: '569cb42fa9c8d4d3cbd16464', status: 'processed' }).count()
          expect(notifications).to.be.eq(1)
        })
      })

      describe.skip('Order status flow ', () => {
        beforeEach('Create registers Collections', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)

          await request(app).get('/vtex/notifications/process/')
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })

        it('should find 9 orders by store Id with Status Pending', async () => {
          const orders = await Order.find({ storeId: '569cb42fa9c8d4d3cbd16464', status: 'pending', platform: 'vtex' }).count()
          expect(orders).to.be.eq(9)
        })

        it('should process 3 orders and set its in Status Processed', async () => {
          await request(app).get('/vtex/orders/process/')
          const orders = await Order.find({ storeId: '569cb42fa9c8d4d3cbd16464', status: 'processed', platform: 'vtex' }).count()
          expect(orders).to.be.eq(9)
        })
      })

      describe.skip('Tracking status flow ', () => {
        beforeEach('Create registers Collections', async () => {
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)
          await request(app).post('/vtex/notifications/create/')
            .send(exampleNotification)

          await request(app).get('/vtex/notifications/process/')
          await request(app).get('/vtex/orders/process/')
        })

        afterEach('Clean Collections', async () => {
          async function clearCollections () {
            for (var collection in mongoose.connection.collections) {
              await mongoose.connection.collections[collection].remove({})
            }
          }
          return await clearCollections()
        })

        it('should find 9 trackings by store Id with Status Pending', async () => {
          const trackings = await Tracking.find({ status: 'pending' }).count()
          expect(trackings).to.be.eq(9)
        })

        it('should process 3 orders and set its in Status Processed', async () => {
          await appFunctions.processTrackings()
          const trackings = await Tracking.find({ status: 'processed' }).count()
          expect(trackings).to.be.eq(9)
        })
      })
    })
  })

  describe.skip('Test WithOut Nock', () => {
    const notificationExample =
    {
      storeId: '5b69f773e4b0b7fef343c636',
      totalOrders: 1,
      ordersId: [
        '1058712992863-01'
      ],
      Shipments:
        [
          {
            orderId: '1058712992863-01',
            packageId: '1'
          }
        ]
    }

    beforeEach('Create registers Collections', async () => {
      await Store.create({
        storeId: '5b69f773e4b0b7fef343c636',
        courierId: 'LYRACONS-IFLOW-DELIVERY',
        authKey: '4d6rtfguijd6rtfguhjierctvyin'
      })
    })

    afterEach('Clean Collections', async () => {
      async function clearCollections () {
        for (var collection in mongoose.connection.collections) {
          await mongoose.connection.collections[collection].remove({})
        }
      }
      return await clearCollections()
    })

    // Host es el mismo: http://www.vtexcarriers.com:8383
    describe('Create a notifications with a store and orders associated', () => {
      // Agregar Store: 5b69f773e4b0b7fef343c636
      it('should find 1 notifications by store Id with Status Pending', async () => {
        await request(app).post('/vtex/notifications/create/')
          .send(notificationExample)
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        expect(notifications).to.be.eq(1)
      })
    })

    describe('Process Notification and Get Single Order Details from Lyracons', () => {
      beforeEach('Create registers Collections', async () => {
        await request(app).post('/vtex/notifications/create/')
          .send(notificationExample)
      })
      // Agregar Token de Seguridad: 4d6rtfguijd6rtfguhjierctvyin
      it('should process 1 notifications and set its in Status Processed', async () => {
        await request(app).get('/vtex/notifications/process/')
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'processed' }).count()
        expect(notifications).to.be.eq(1)
      })

      it('should be 1 orders with Status Pending', async () => {
        const orders = await Order.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        // En base a las ordenes que nos pasen modificar el count que espera.
        expect(orders).to.be.eq(1)
      })
      it('should process N orders and set its in Status Processed', async () => {
        // Verificar que tengan el mismo Id de Orden que nos paso Lyracons
        await request(app).get('/vtex/orders/process/')
        const orders = await Order.find({ storeId: '569cb42fa9c8d4d3cbd16464', status: 'processed', platform: 'vtex' }).count()
        // En base a las ordenes que nos pasen modificar el count que espera.
        expect(orders).to.be.eq(1)
      })

      // TRACKING
      // Should find N trackings Depending the orders that are created
      it.skip('should find N trackings by store Id with Status Pending', async () => {
        const trackings = await Tracking.find({ status: 'pending' }).count()
        // En base a las ordenes que nos pasen modificar el count que espera.
        expect(trackings).to.be.eq(' ')
      })
    })

    describe.skip('Process Trackings', () => {
      it('should process N Trackings and set its in Status Processed', async () => {
        await appFunctions.processTrackings()
        const trackings = await Tracking.find({ status: 'processed' }).count()
        expect(trackings).to.be.eq(9)
      })
    })
  })

  describe.skip('Test With Nock Since getSingle Order ', () => {
    const notificationExample =
    {
      storeId: '5b69f773e4b0b7fef343c636',
      totalOrders: 1,
      ordersId: [
        '1058712992863-01'
      ],
      Shipments:
        [
          {
            orderId: '1058712992863-01',
            packageId: '1'
          }
        ]
    }

    before(() => {
      // GetSingleOrderDetails
      nock(config.vtexCarriers.host)
        .get(uri => uri.includes(config.vtexCarriers.paths.getOrder))
        .reply(200, function () {
          return nockData.realSampleResponseGetSingleOrderDetails()
        })
        .persist()

        // // SoftligthCrateOrder
        // nock(config.softLight.host, {
        //   reqheaders: {
        //     Authorization: 'Bearer ' + token
        //   }
        // })
        .post(uri => uri.includes(config.softLight.paths.createOrder))
        .reply(201, function () {
          return nockData.realSampleResponseSoftligthCrateOrder()
        })
        .persist()

      // // GetSoftLightToken
      // nock(config.softLight.host)
      //   .post(uri => uri.includes(config.softLight.paths.login))
      //   .reply(function () {
      //     return nockData.realSampleResponseGetSoftLightToken
      //   })
      //   .persist()
    })

    beforeEach('Create registers Collections', async () => {
      await Store.create({
        storeId: '5b69f773e4b0b7fef343c636',
        courierId: 'LYRACONS-IFLOW-DELIVERY',
        authKey: '4d6rtfguijd6rtfguhjierctvyin'
      })

      await request(app).post('/vtex/notifications/create/')
        .send(notificationExample)
    })

    after('Clean Collections', async () => {
      async function clearCollections () {
        for (var collection in mongoose.connection.collections) {
          await mongoose.connection.collections[collection].remove({})
        }
      }
      return await clearCollections()
    })

    describe('Process Notification and Get Single Order Details from Lyracons', () => {
      it('should process 1 notifications and set its in Status Processed', async () => {
        await request(app).get('/vtex/notifications/process/')
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'processed' }).count()
        expect(notifications).to.be.eq(1)
      })

      it('should be 1 orders with Status Pending', async () => {
        const orders = await Order.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        // En base a las ordenes que nos pasen modificar el count que espera.
        expect(orders).to.be.eq(1)
      })

      it('should process 1 orders and set its in Status Processed', async () => {
        await request(app).get('/vtex/orders/process/')
        const orders = await Order.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'processed', platform: 'vtex' }).count()
        expect(orders).to.be.eq(1)
      })

      // TRACKING
      // Should find N trackings Depending the orders that are created
      it('should find N trackings by store Id with Status Pending', async () => {
        const trackings = await Tracking.find({ status: 'pending' }).count()
        // En base a las ordenes que nos pasen modificar el count que espera.
        expect(trackings).to.be.eq(' ')
      })
    })

    describe.skip('Process Trackings', () => {
      it('should process N Trackings and set its in Status Processed', async () => {
        await appFunctions.processTrackings()
        const trackings = await Tracking.find({ status: 'processed' }).count()
        expect(trackings).to.be.eq(9)
      })
    })
  })

  describe.skip('Cron with Nock', () => {
    before(() => {
      // SoftligthCrateOrder
      nock(config.softLight.host)
        .post(uri => uri.includes(config.softLight.paths.createOrder))
        .reply(200, nockData.sampleResponseSoftligthCrateOrder)
        .persist()
      // GetSingleOrderDetails
      nock(config.vtexCarriers.host)
        .get(uri => uri.includes(config.vtexCarriers.paths.getOrder))
        .reply(200, function () {
          return nockData.realSampleResponseGetSingleOrderDetails()
        })
        .persist()
    })

    beforeEach('Create registers Collections', async () => {
      await Store.create({
        storeId: '5b69f773e4b0b7fef343c636',
        courierId: 'LYRACONS-IFLOW-DELIVERY',
        authKey: '4d6rtfguijd6rtfguhjierctvyin'
      })
      await request(app).post('/vtex/notifications/create/')
        .send(realNotificationExample)

      await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
    })

    after('Clean Collections', async () => {
      async function clearCollections () {
        for (var collection in mongoose.connection.collections) {
          await mongoose.connection.collections[collection].remove({})
        }
      }
      return await clearCollections()
    })

    console.log('Running Cron - Test')
    describe('Process Notifications', () => {
      // First Step

      it('should found 1 notifications with status "pending"', async () => {
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        expect(notifications).to.be.eq(1)
      })

      it('procces Notifications', async () => {
        await appFunctions.processNotifications()
      })

      it('should process 1 notifications and set its in Status Processed', async () => {
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'processed' }).count()
        expect(notifications).to.be.eq(1)
      })

      it('should be 1 Orders with Status Pending', async () => {
        const orders = await Order.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        expect(orders).to.be.eq(1)
      })
    })

    describe.skip('Process Orders', () => {
      // Second Step
      appFunctions.processOrders()

      it('should process 1 notifications and set its in Status Processed', async () => {
        const notifications = await Notification.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'processed' }).count()
        expect(notifications).to.be.eq(1)
      })
      it('should be 1 orders with Status Pending', async () => {
        const orders = await Order.find({ storeId: '5b69f773e4b0b7fef343c636', status: 'pending' }).count()
        expect(orders).to.be.eq(1)
      })
    })

    describe.skip('Process Orders', () => {
      // Third Step
      appFunctions.processTrackings()

      it('should process 1 notifications and set its in Status Processed', async () => {
      })
      it('should be 1 orders with Status Pending', async () => {
      })
    })
  })
})
