const readline = require('readline');
const chalk = require('chalk');
const { spinner, banner, menu } = require('./lib/loading');
const { buatTempMail, cekInbox } = require('./lib/tempMail');
const sendLink = require('./lib/sendLink');
const verify = require('./lib/verify');
const promote = require('./lib/promote');
const struk = require('./lib/struk');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function flowEmailSendiri() {
  const email = (await ask(chalk.cyan('📧 Masukkan email lu: '))).trim();
  if (!email.includes('@')) throw new Error('Email gak valid');

  const sp = spinner('Mengirim magic link...', 'yellow');
  const link = await sendLink(email);
  if (!link.ok) { sp.fail(chalk.red('Gagal kirim link')); throw new Error(link.why); }
  sp.succeed(chalk.green('Magic link terkirim! Cek inbox/spam.'));

  console.log(chalk.gray('\n📩 Buka email lu, copy link verifikasi.'));
  const rawLink = (await ask(chalk.cyan('🔗 Paste magic link: '))).trim();
  if (!rawLink) throw new Error('Link kosong');

  const sv = spinner('Verifikasi akun...', 'blue');
  const v = await verify(email, rawLink);
  if (!v.ok) { sv.fail(chalk.red('Verifikasi gagal')); throw new Error(v.why); }
  sv.succeed(chalk.green('Login OK. UID: ' + v.uid));

  const sp2 = spinner('Promote ke premium...', 'magenta');
  const p = await promote(v.id);
  if (!p.ok) { sp2.fail(chalk.red('Promote gagal')); throw new Error(p.why); }
  sp2.succeed(chalk.green('Premium aktif!'));

  struk(email, p.orderId, v.uid, v.baru);

  console.log(chalk.yellow('\n📋 PERUBAHAN AKUN:'));
  console.log(chalk.white('  ✔ Status     : FREE → PREMIUM'));
  console.log(chalk.white('  ✔ Paket      : Annual Subscription'));
  console.log(chalk.white('  ✔ Order ID   : ' + p.orderId));
  console.log(chalk.white('  ✔ UID        : ' + v.uid));
  console.log(chalk.white('  ✔ Akun tipe  : ' + (v.baru ? 'Baru' : 'Lama')));
}

async function flowEmailTemp() {
  const jumlahStr = (await ask(chalk.cyan('🔢 Mau bikin berapa akun? (1-10): '))).trim();
  const jumlah = parseInt(jumlahStr);
  if (isNaN(jumlah) || jumlah < 1 || jumlah > 10) {
    throw new Error('Jumlah harus antara 1-10');
  }

  console.log(chalk.yellow(`\n⏳ Membuat ${jumlah} email temp...\n`));

  const daftarEmail = [];
  for (let i = 0; i < jumlah; i++) {
    const sp = spinner(`[${i + 1}/${jumlah}] Membuat email temp...`, 'cyan');
    const temp = await buatTempMail();
    sp.succeed(chalk.green(`[${i + 1}/${jumlah}] ${temp.address}`));
    daftarEmail.push(temp);
  }

  console.log(chalk.cyan('\n┌─────────────────────────────────────┐'));
  console.log(chalk.cyan('│') + chalk.white('       DAFTAR EMAIL TEMP             ') + chalk.cyan('│'));
  console.log(chalk.cyan('├─────────────────────────────────────┤'));
  daftarEmail.forEach((t, i) => {
    console.log(chalk.cyan('│') + chalk.yellow(` [${i + 1}] `) + chalk.white(t.address.padEnd(31)) + chalk.cyan('│'));
  });
  console.log(chalk.cyan('└─────────────────────────────────────┘'));

  console.log(chalk.gray('\n💡 Buka inbox di browser (login langsung tanpa password):'));
  daftarEmail.forEach((t, i) => {
    console.log(chalk.cyan(`  [${i + 1}] `) + chalk.blue.underline(t.webUrl));
  });

  const konfirm = (await ask(chalk.cyan('\n🚀 Lanjut proses semua akun ini? (y/n): '))).trim().toLowerCase();
  if (konfirm !== 'y') {
    console.log(chalk.gray('Dibatalkan.'));
    return;
  }

  console.log(chalk.yellow('\n⏳ Memproses semua akun...\n'));

  const hasil = [];
  for (let i = 0; i < daftarEmail.length; i++) {
    const t = daftarEmail[i];
    console.log(chalk.gray('\n─── Akun ' + (i + 1) + '/' + daftarEmail.length + ' ───'));
    console.log(chalk.white('📧 ' + t.address));

    try {
      const sp1 = spinner('  Kirim magic link...', 'yellow');
      const link = await sendLink(t.address);
      if (!link.ok) throw new Error('Gagal kirim: ' + link.why);
      sp1.succeed(chalk.green('  Magic link terkirim'));

      const sp2 = spinner('  Menunggu email masuk...', 'blue');
      let rawLink = null;
      for (let j = 0; j < 30; j++) {
        await new Promise(r => setTimeout(r, 3000));
        const emails = await cekInbox(t.client, t.token);
        if (emails && emails.length > 0) {
          const body = (emails[0].body || '') + ' ' + (emails[0].html || '');
          const match = body.match(/https?:\/\/[^\s"<>]+oobCode=[^\s"<>]+/i);
          if (match) { rawLink = match[0]; break; }
        }
        sp2.text = chalk.blue(`  Menunggu email masuk... (${(j + 1) * 3}s)`);
      }
      if (!rawLink) { sp2.fail(chalk.red('  Timeout')); hasil.push({ email: t.address, ok: false, why: 'Timeout' }); continue; }
      sp2.succeed(chalk.green('  Link ketemu'));

      const sp3 = spinner('  Verifikasi...', 'blue');
      const v = await verify(t.address, rawLink);
      if (!v.ok) { sp3.fail(chalk.red('  Verifikasi gagal')); hasil.push({ email: t.address, ok: false, why: v.why }); continue; }
      sp3.succeed(chalk.green('  Login OK — UID: ' + v.uid));

      const sp4 = spinner('  Promote premium...', 'magenta');
      const p = await promote(v.id);
      if (!p.ok) { sp4.fail(chalk.red('  Promote gagal')); hasil.push({ email: t.address, ok: false, why: p.why }); continue; }
      sp4.succeed(chalk.green('  Premium aktif — ' + p.orderId));

      hasil.push({
        email: t.address,
        ok: true,
        uid: v.uid,
        orderId: p.orderId,
        baru: v.baru,
        webUrl: t.webUrl
      });

    } catch (e) {
      hasil.push({ email: t.address, ok: false, why: e.message });
    }
  }

  console.log(chalk.cyan('\n\n╔═══════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('           RINGKASAN HASIL AKHIR                      ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════════╝\n'));

  const sukses = hasil.filter(h => h.ok);
  const gagal = hasil.filter(h => !h.ok);

  console.log(chalk.green(`✅ Sukses: ${sukses.length}/${hasil.length}`));
  console.log(chalk.red(`❌ Gagal : ${gagal.length}/${hasil.length}\n`));

  if (sukses.length > 0) {
    console.log(chalk.cyan('┌─── AKUN YANG BERHASIL ────────────────────────────────┐'));
    sukses.forEach((h, i) => {
      console.log(chalk.white(`\n  [${i + 1}] ${h.email}`));
      console.log(chalk.gray('      ├─ Status  : FREE → PREMIUM ✅'));
      console.log(chalk.gray('      ├─ Paket   : Annual Subscription'));
      console.log(chalk.gray('      ├─ Order   : ' + h.orderId));
      console.log(chalk.gray('      ├─ UID     : ' + h.uid));
      console.log(chalk.gray('      ├─ Tipe    : ' + (h.baru ? 'Baru' : 'Lama')));
      console.log(chalk.gray('      └─ Inbox   : ' + chalk.blue.underline(h.webUrl)));
    });
    console.log(chalk.cyan('\n└───────────────────────────────────────────────────────┘'));
  }

  if (gagal.length > 0) {
    console.log(chalk.red('\n┌─── AKUN YANG GAGAL ───────────────────────────────────┐'));
    gagal.forEach((h, i) => {
      console.log(chalk.white(`  [${i + 1}] ${h.email}`));
      console.log(chalk.red('      └─ Error: ' + h.why));
    });
    console.log(chalk.red('└───────────────────────────────────────────────────────┘'));
  }

  console.log(chalk.yellow('\n💡 Simpan info di atas sebelum email temp expired (1 jam).\n'));
}

async function main() {
  console.clear();
  banner();
  menu();

  try {
    const pilih = (await ask(chalk.cyan('\n👉 Pilih (0/1/2): '))).trim();
    console.log('');

    if (pilih === '1') await flowEmailSendiri();
    else if (pilih === '2') await flowEmailTemp();
    else if (pilih === '0') { console.log(chalk.gray('Keluar...')); rl.close(); return; }
    else throw new Error('Pilihan gak valid');
  } catch (e) {
    console.log('\n' + chalk.red('❌ ' + e.message));
  } finally {
    rl.close();
  }
}

main();
