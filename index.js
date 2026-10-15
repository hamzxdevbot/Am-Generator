const readline = require('readline');
const sendLink = require('./lib/sendLink');
const verify = require('./lib/verify');
const promote = require('./lib/promote');
const struk = require('./lib/struk');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log('\n===== AM PREM — TERMUX =====\n');
  console.log('Halo Radit 👋\n');

  try {
    const email = (await ask('📧 Email: ')).trim();
    if (!email.includes('@')) throw new Error('Email gak valid');

    console.log('\n⏳ Kirim magic link...');
    const link = await sendLink(email);
    if (!link.ok) throw new Error('Gagal kirim link: ' + link.why);
    console.log('✅ Link terkirim! Cek inbox/spam.');

    const rawLink = (await ask('\n🔗 Paste magic link: ')).trim();
    if (!rawLink) throw new Error('Link kosong');

    console.log('\n⏳ Verifikasi...');
    const v = await verify(email, rawLink);
    if (!v.ok) throw new Error('Verifikasi gagal: ' + v.why);
    console.log('✅ Login OK.');

    console.log('\n⏳ Promote ke premium...');
    const p = await promote(v.id);
    if (!p.ok) throw new Error('Promote gagal: ' + p.why);

    struk(email, p.orderId, v.uid, v.baru);
  } catch (e) {
    console.log('\n❌ ' + e.message);
  } finally {
    rl.close();
  }
}

main();