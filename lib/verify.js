const axios = require('axios');
const { KEY, IDT, H1 } = require('../config/constants');
const { sp, bad, parseCode } = require('./utils');

async function verify(email, raw) {
  const c = parseCode(raw);
  if (!c) return { ok: false, why: 'oobCode tidak ditemukan' };

  try {
    const a = await axios.post(`${IDT}/emailLinkSignin?key=${KEY}`, {
      email,
      oobCode: c,
      clientType: 'CLIENT_TYPE_ANDROID'
    }, { headers: sp(H1) });

    return {
      ok: true,
      id: a.data.idToken,
      ref: a.data.refreshToken,
      uid: a.data.localId,
      baru: !!a.data.isNewUser
    };
  } catch (e) {
    return { ok: false, why: bad(e) };
  }
}

module.exports = verify;
