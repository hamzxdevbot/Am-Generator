const crypto = require('crypto');

function dip() {
  return [
    crypto.randomInt(1, 255),
    crypto.randomInt(0, 255),
    crypto.randomInt(0, 255),
    crypto.randomInt(1, 255)
  ].join('.');
}

function sp(h) {
  return {
    ...h,
    'x-forwarded-for': dip(),
    'x-real-ip': dip(),
    'client-ip': dip(),
    'x-client-ip': dip(),
    'x-originating-ip': dip(),
    'x-cluster-client-ip': dip()
  };
}

function bad(e) {
  const d = e.response?.data;
  return d
    ? typeof d === 'object' ? JSON.stringify(d) : String(d)
    : e.message;
}

function parseCode(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/&amp;/g, '&');
  try { s = decodeURIComponent(s); } catch {}

  try {
    const u = new URL(s);
    let c = u.searchParams.get('oobCode');
    if (!c) {
      const n = u.searchParams.get('link') || u.searchParams.get('q') || u.searchParams.get('url');
      if (n) { try { c = new URL(n).searchParams.get('oobCode'); } catch {} }
    }
    if (c) return c.replace(/[^a-zA-Z0-9_-]/g, '');
  } catch {}

  const m = s.match(/oobCode=([a-zA-Z0-9_-]+)/i);
  if (m) return m[1];

  const t = raw.trim();
  if (/^[a-zA-Z0-9_-]{10,}$/.test(t) && !t.includes('://')) return t;
  return null;
}

module.exports = { dip, sp, bad, parseCode };
