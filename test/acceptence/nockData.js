const orderExample = require('../../examples/order_detail_response.json')
// const orderExampleLyraconsCaba = require('../../examples/order_detail_response_caba.json')

exports.sampleResponseGetSoftLightToken =
{
  success: true,
  message: '',
  token: 'eyJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6Im1jb3J0aSIsImlhdCI6MTUwMjk5NDkzMiwiZXhwIjoxNTAyOTk4NTMyfQ.RNZueDrauGeNb0_uyiAfDTI0mDdl0I81SnFhxrYGJD8oMNiIVcegP16pcEdPmENSw0gkyK8rA2sfRUBlUc8AID7nLtg-RPpRMY_I_3QdEMKv32o9e-1KqevSQzrcbuRUwZa1jRvdN-nX6ovatPkl4kTxVmUgEvmtvIT0-KqjOXk3UriXtNSEwYfIiTG0UWnNXEMdsVdiL73HrcX1cGO9dC8ydS0boXJmwYdgxDM5QS2nRS6pN2NVt1Su3G3Xq7m1usFyr3NRuxn_CHpFiAG2fgLf-CF33oR1ITVhiNkwWhG2EhCOjz6wUErt6Hfm7I24gkQl0IXwzge6IaDMrdT0AXkCKTOvCJm1m82iAgBVpdqPTkr8dZ5PTBewB3fFK7JzMKtaRMSx4TLxSk5PVmjN1OwtzHdGnfrIdk3FSD8HY2yX5g0UAGLvRkEFG3Zy4xyb4gDMQlo9WPDFVy1SuGICPndrP_bT2_ZsgGrUZ3EmL6_z6CwQAnYaiKdjdlUEf6hP5lHDefrcu5UTwzga9RmxMPgqDFBAeUMwWYG24ktQI2K9R-ryy5vq0F-D2ZRrQ34682RrdR8Odhrtz52RFyC9RvFOtWUPtWVy1XyGRAvGmVIra8AEMgddwc3T9j5Mnn9h4Ideqb17Xl7odbmUZMuHYbPIknmp7SSLTU3H7mRBPhw'
}

exports.realSampleResponseGetSoftLightToken =
{
  success: true,
  message: '',
  token: 'eyJhbGciOiJSUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0NVU1RPTUVSIiwiUk9MRV9BUElfQ0xJRU5UIiwiUk9MRV9BUElfQ0xJRU5UX0NBTkNFTF9PUkRFUiIsIlJPTEVfQVBJX0NMSUVOVF9DQU5DRUxfU0hJUFBJTkciLCJST0xFX0FQSV9DTElFTlRfTUVSQ0hBTlRfT1JERVJfQUREIiwiUk9MRV9BUElfQ0xJRU5UX1NISVBQSU5HX1JFVFVSTiIsIlJPTEVfQVBJIl0sInVzZXJuYW1lIjoiY2xpZW50ZV90ZXN0IiwidGVybXNfYWNjZXB0ZWQiOnRydWUsInByZXBhZ28iOnRydWUsImxvZ2lzdGljYV9pbnZlcnNhIjp0cnVlLCJ1c2VyX3R5cGUiOiJDbGllbnQiLCJpYXQiOjE1OTkxNTE5ODcsImV4cCI6MTU5OTE1NTU4N30.Cg-1i7uWqkx-QQamwz4WpXaqAgY8ZdOT09XXZ8Xhsxzx6ipMHbqd-6pRqAXkPVDBF7tVt2NhT6xEJHjBXZTdmgj9HkENwupQu7WdXE0V_pLBQ0gNzQrrDDIZ7zBMqh1ig1v3H4daWYWdROutEwn4SogwkJQwyyihisHszhmnbDSV7j8_r9-leITl45P21iEfn70t35kKImeae2D_4JOrWI8tsFxk3xdB3p6OqMEjPFpTTvxkuMVMWNYlGEeoseBZpVTnxmd95SgZ9FugLdiEvwX-BQLf9SXYi_O_VOA3fC5uXzsdfbK1R5T6Z2K2wZYcVAqgdu1_z1FIjkSoE4OMI_oVAGPFD1mP2jfGS9KCd9biEFlAiOhbjLdZBQQ7XaUpdeRhyI19ARdKDUnfvp-8drmduFZKQ-aA2Mi6HzFPe0yB5iQmbyxaaM4ZJySXuldhmE_wAtG5iMEDGegj4IdSTFVuHelzxRc4ObYHXnh99LUfLNpXHhQqKUGF8AkSVpE9szEiPjGn9GoRqwYhE8mwPAuilIpjlHLj68C47jXWPZ_hLkMDRLWrf1_Ftv20pRLFbz5VUxm8tO7upRaquUoG0pJiughp8PYjpF_FC1wLnaOXVreE7jAONoTpVwOLIWjgRXfDToYhNTmi7_ZuP4gWs0pAEPt75lu5ieKlzSkNGE0'
}

exports.sampleResponseSoftligthCrateOrder =
{
  code: 201,
  success: true,
  message: 'Se ha creado con éxito la Orden #1230',
  results: {
    tracking_id: 'OR0000971841',
    order_id: '1230',
    shippings: [
      {
        order_id: '1230',
        shipment_id: 'T00000000098',
        print_url: 'http://test-api.iflow21.com/api/order/print/436364/T00000000098.pdf'
      }
    ]
  }
}

exports.realSampleResponseSoftligthCrateOrder =
{
  code: 201,
  success: true,
  message: 'Se ha creado con éxito la Orden #1058712992863-01',
  results: {
    tracking_id: 'OR0000976910',
    order_id: '1058712992863-01',
    shippings: [
      {
        order_id: '1058712992863-01',
        shipment_id: '-',
        /*eslint-disable */
        print_url: 'http:\/\/test-api.iflow21.com\/api\/v1\/public\/shipping\/print\/977093\/TES0000000001887.pdf',
        /* eslint-enable */
        can_return: false,
        can_request_edit: false,
        order_multiple_shippings: true
      }
    ]
  }
}

exports.sampleResponsePostRateToSoftLight =
{
  code: 200,
  message: 'Estimación realizada con éxito.',
  count: 1,
  results: {
    final_value: 136.4
  }
}

exports.sampleResponseGetSingleOrderDetails = (id) => {
  const resp = {
    notification: ' ',
    store: {},
    order: orderExample.order,
    items: orderExample.items
  }
  resp.order.orderId = id
  return resp
}

exports.realSampleResponseGetSingleOrderDetails = () => {
  const resp = {
    account: {
      accountId: 'LYRACONS-IFLOW-DELIVERY'
    },
    order: {
      orderId: '1058712992863-01',
      packageId: '0',
      lastname: 'holl',
      name: 'mar',
      documentType: 'dni',
      document: '31670479',
      address: {
        street: 'thames|',
        number: '2215',
        addressComplement: 'A',
        postalCode: '1425',
        city: 'Ciudad Autónoma de Buenos Aires',
        state: 'Buenos Aires',
        receiverName: 'mar holl',
        comments: null,
        dockId: 'General'
      },
      value: '149900',
      tax: '',
      startDateUtc: null,
      lastMessage: null,
      courierName: 'LYRACONS-IFLOW-DELIVERY',
      email: 'ca9db49c29814194b1fa91a8b6eec8ba@ct.vtex.com.br',
      phone: '+5491154723014',
      branch: null
    },
    items: [
      {
        productId: '123123123',
        name: 'Cebolla Blanca Blanca',
        cubicweight: 0,
        weight: 1,
        height: 1,
        width: 1,
        lenght: 1,
        quantity: 5,
        price: 10000,
        tax: 1000
      }, {
        productId: '000012',
        name: 'chomba negra talle s',
        cubicweight: 0,
        weight: 1,
        height: 1,
        width: 1,
        lenght: 1,
        quantity: 1,
        price: 89900,
        tax: 17900
      }
    ],
    _id: {
      $oid: '5f4e65c5e39dfa5787a251a4'
    }
  }
  return resp
}

exports.sampleResponsePostTrackingToLyracon =
{
  code: 200,
  trackingId: 'OR0000971841',
  packageId: '1',
  courierId: '1',
  storeId: '569cb42fa9c8d4d3cbd16464',
  orderId: '638850516599-01',
  order: { orderExample }
}
