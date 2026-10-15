const readline = require('readline');
const chalk = require('chalk');
const { banner, menu, title, divider } = require('./lib/loading');
const { buatTempMail, cekInbox } = require('./lib/tempMail');
const sendLink = require('./lib/sendLink');
const verify = require('./lib/verify');
const promote = require('./lib/promote');
const struk = require('./lib/struk');

function tanya(q) {
  return new Promise(res => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, ans => { rl.close(); res(String(ans || '').trim()); });
  });
}

async function flow1() {
  title('EMAIL SENDIRI');
  const email = await tanya(chalk.cyan('📧 Email: '));
  if (!email.includes('@')) return console.log(chalk.red('\n❌ Email gak valid.'));

  console.log(chalk.yellow('⏳ Kirim magic link...'));
  const link = await sendLink(email);
  if (!link.ok) return console.log(chalk.red('❌ Gagal: ' + link.why));
  console.log(chalk.green('✅ Link terkirim! Cek inbox.'));

  const raw = await tanya(chalk.cyan('\n🔗 Paste magic link: '));
  if (!raw) return console.log(chalk.red('❌ Kosong.'));

  console.log(chalk.blue('⏳ Verifikasi...'));
  const v = await verify(email, raw);
  if (!v.ok) return console.log(chalk.red('❌ Gagal: ' + v.why));
  console.log(chalk.green('✅ Login OK. UID: ' + v.uid));

  console.log(chalk.magenta('⏳ Promote...'));
  const p = await promote(v.id);
  if (!p.ok) return console.log(chalk.red('❌ Gagal: ' + p.why));
  console.log(chalk.green('✅ Premium aktif!'));

  struk(email, p.orderId, v.uid, v.baru);
  console.log(chalk.yellow('\n📋 Perubahan:'));
  console.log(chalk.white('  ✔ FREE → PREMIUM'));
  console.log(chalk.white('  ✔ Paket: Annual'));
  console.log(chalk.white('  ✔ Order: ' + p.orderId));
}

async function flow2() {
  title('EMAIL TEMP BULK');
  const n = parseInt(await tanya(chalk.cyan('🔢 Berapa? (1-10): ')));
  if (isNaN(n) || n < 1 || n > 10) return console.log(chalk.red('\n❌ 1-10 aja.'));

  console.log(chalk.yellow(`\n⏳ Bikin ${n} email...\n`));
  const list = [];
  for (let i = 0; i < n; i++) {
    try {
      const t = await buatTempMail();
      console.log(chalk.green(`✅ [${i+1}/${n}] ${t.address}`));
      list.push(t);
    } catch (e) { console.log(chalk.red(`❌ [${i+1}/${n}] Gagal`)); }
  }
  if (!list.length) return console.log(chalk.red('\n❌ Gak ada.'));

  console.log(chalk.cyan('\n📬 Daftar Email:'));
  list.forEach((t, i) => {
    console.log(chalk.yellow(`  [${i+1}] `) + chalk.white(t.address));
    console.log(chalk.gray('       ' + chalk.blue.underline(t.webUrl)));
  });

  const ok = (await tanya(chalk.cyan('\n🚀 Lanjut? (y/n): '))).toLowerCase();
  if (ok !== 'y') return console.log(chalk.gray('Batal.'));

  const hasil = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    divider();
    console.log(chalk.white(`📧 [${i+1}/${list.length}] ${t.address}`));
    try {
      console.log(chalk.yellow('  ⏳ Kirim link...'));
      const l = await sendLink(t.address);
      if (!l.ok) { console.log(chalk.red('  ❌ Gagal')); hasil.push({email:t.address,ok:false,why:l.why}); continue; }
      console.log(chalk.green('  ✅ Terkirim'));

      console.log(chalk.blue('  ⏳ Tunggu email (max 90s)...'));
      let raw = null;
      for (let j = 0; j < 30; j++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const em = await cekInbox(t.client, t.token);
          if (em && em.length) {
            const b = (em[0].body || '') + ' ' + (em[0].html || '');
            const m = b.match(/https?:\/\/[^\s"<>]+oobCode=[^\s"<>]+/i);
            if (m) { raw = m[0]; break; }
          }
        } catch {}
        process.stdout.write(chalk.gray(`\r  ⏳ ${(j+1)*3}s...`));
      }
      process.stdout.write('\r' + ' '.repeat(30) + '\r');
      if (!raw) { console.log(chalk.red('  ❌ Timeout')); hasil.push({email:t.address,ok:false,why:'Timeout'}); continue; }
      console.log(chalk.green('  ✅ Ketemu'));

      console.log(chalk.blue('  ⏳ Verifikasi...'));
      const v = await verify(t.address, raw);
      if (!v.ok) { console.log(chalk.red('  ❌ Gagal')); hasil.push({email:t.address,ok:false,why:v.why}); continue; }
      console.log(chalk.green('  ✅ OK — ' + v.uid));

      console.log(chalk.magenta('  ⏳ Promote...'));
      const p = await promote(v.id);
      if (!p.ok) { console.log(chalk.red('  ❌ Gagal')); hasil.push({email:t.address,ok:false,why:p.why}); continue; }
      console.log(chalk.green('  ✅ Premium!'));

      hasil.push({email:t.address,ok:true,uid:v.uid,orderId:p.orderId,baru:v.baru,webUrl:t.webUrl});
    } catch (e) { hasil.push({email:t.address,ok:false,why:e.message}); }
  }

  const ok1 = hasil.filter(h => h.ok), no = hasil.filter(h => !h.ok);
  console.log(chalk.cyan('\n═══ HASIL ═══'));
  console.log(chalk.green(`✅ ${ok1.length}/${hasil.length}`));
  console.log(chalk.red(`❌ ${no.length}/${hasil.length}`));
  ok1.forEach((h,i) => {
    console.log(chalk.white(`\n[${i+1}] ${h.email}`));
    console.log(chalk.gray('  Status: FREE → PREMIUM ✅'));
    console.log(chalk.gray('  Order : ' + h.orderId));
    console.log(chalk.gray('  UID   : ' + h.uid));
    console.log(chalk.gray('  Inbox : ' + h.webUrl));
  });
  no.forEach((h,i) => console.log(chalk.red(`\n[${i+1}] ${h.email} — ${h.why}`)));
  console.log(chalk.yellow('\n💡 Simpen sebelum expired (1 jam).'));
}

async function main() {
  while (true) {
    console.clear();
    banner();
    menu();
    const p = await tanya(chalk.cyan('\n👉 Pilih: '));
    if (p === '1') { try { await flow1(); } catch(e) { console.log(chalk.red('\n❌ ' + e.message)); } await tanya(chalk.gray('\n⏎ Enter...')); }
    else if (p === '2') { try { await flow2(); } catch(e) { console.log(chalk.red('\n❌ ' + e.message)); } await tanya(chalk.gray('\n⏎ Enter...')); }
    else if (p === '3') { console.log(chalk.gray('\n👋 Bye!')); process.exit(0); }
    else { console.log(chalk.red('\n❌ Salah.')); await new Promise(r => setTimeout(r, 1000)); }
  }
}

process.on('SIGINT', () => process.exit(0));
main();
