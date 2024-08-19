const softlightHost = process.env.PROD_IFLOW_API || 'https://api.iflow21.com/' // SOFTLIGHT_HOST

exports.softLight = {
  host: softlightHost,
  paths: {
    login: 'api/login',
    createOrder: 'api/order/create',
    getRate: 'api/rate'
  },
  user: process.env.SOFTLIGHT_USER || 'iflow',
  pass: process.env.SOFTLIGHT_PASS || 'iflow'
  // softLightUser: 'p4design',
  // softlightPassword: 'p4design2020'
}

exports.tracking = {
  host: `${softlightHost}#/tracking`
}

exports.vtexCarriers = {
  host: process.env.VTEX_CARRIERS_HOST || 'http://www.lyracons.com:9999/',
  // host: process.env.LYRACONS_HOST,
  paths: {
    getOrder: 'order',
    createTracking: 'tracking'
  }
}

exports.iFlow = {
  courierId: 't7hjfdfd'
}
