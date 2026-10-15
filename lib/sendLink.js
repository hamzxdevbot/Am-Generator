const axios = require('axios');
const { KEY, IDT, H1 } = require('../config/constants');
const { sp, bad } = require('./utils');

async function sendLink(email) {
  const c1 = { identifier: email, continueUri: 'http://localhost' };
  const c2 = {
    requestType: 6,
    email,
    androidInstallApp: true,
    canHandleCodeInApp: true,
    continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
    iosBundleId: 'com.alightcreative.motion',
    androidPackageName: 'com.alightcreative.motion',
    androidMinimumVersion: '585',
    clientType: 'CLIENT_TYPE_ANDROID'
  };

  try {
    await axios.post(`${IDT}/createAuthUri?key=${KEY}`, c1, { headers: sp(H1) });
    const r = await axios.post(`${IDT}/getOobConfirmationCode?key=${KEY}`, c2, { headers: sp(H1) });
    return { ok: true, data: r.data };
  } catch (e) {
    return { ok: false, why: bad(e) };
  }
}

module.exports = sendLink;
