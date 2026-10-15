const axios = require('axios');
const crypto = require('crypto');
const { VFY, H2, PRODUCT_ID, PLAY_TOKEN, FB_INSTANCE } = require('../config/constants');
const { sp, bad } = require('./utils');

async function promote(idToken) {
  const orderId = 'neo-' + crypto.randomBytes(6).toString('hex');
  const body = {
    data: {
      productId: PRODUCT_ID,
      token: PLAY_TOKEN,
      skuType: 'subs',
      orderId
    }
  };

  const headers = sp({
    ...H2,
    authorization: 'Bearer ' + idToken,
    'firebase-instance-id-token': FB_INSTANCE
  });

  try {
    const r = await axios.post(VFY, body, { headers });
    return { ok: true, orderId, data: r.data };
  } catch (e) {
    return { ok: false, why: bad(e) };
  }
}

module.exports = promote;
