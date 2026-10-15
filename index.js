const readline = require('readline');
const chalk = require('chalk');
const { spinner, banner, menu, line, title, divider, formatDuration } = require('./lib/loading');
const { buatTempMail, cekInbox } = require('./lib/tempMail');
const sendLink = require('./lib/sendLink');
const verify = require('./lib/verify');
const promote = require('./lib/promote');
const struk = require('./lib/struk');

let rl;

function buatRL() {
  if (rl) rl.close();
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
}

const ask = (q) => new Promise((res) => rl.question(q, res));

function pause() {
  return new Promise((res) => {
    rl.question(chalk.gray('\n⏎ Tekan Enter buat kembali ke menu...'), () => res());
  });
}

// ============ FLOW 1: EMAIL SENDIRI ============
async function flowEmailSendiri() {
  title('MODE EMAIL SENDIRI');

  const email = (await ask(chalk.cyan('📧 Masukkan email lu: '))).trim();
  if (!email.includes('@')) {
    console.log(chalk.red('\n❌ Email gak valid.'));
    return;
  }

  const sp = spinner('Mengirim magic link...', 'yellow', 'dots');
  const link = await sendLink(email);
  if (!link.ok) {
    sp.fail(chalk.red('Gagal kirim link'));
    console.log(chalk.red('   Detail: ' + link.why));
    return;
  }
  sp.succeed(chalk.green('Magic link terkirim! Cek inbox/spam.'));

  console.log(chalk.gray('\n📩 Buka email lu, copy link verifikasi (yang ada oobCode-nya).'));
  const rawLink = (await ask(chalk.cyan('🔗 Paste magic link: '))).trim();
  if (!rawLink) {
    console.log(chalk.red('\n❌ Link kosong.'));
    return;
  }

  const sv = spinner('Verifikasi akun...', 'blue', 'arc');
  const v = await verify(email, rawLink);
  if (!v.ok) {
    sv.fail(chalk.red('Verifikasi gagal'));
    console.log(chalk.red('   Detail: ' + v.why));
    return;
  }
  sv.succeed(chalk.green('Login OK. UID: ' + v.uid));

  const sp2 = spinner('Promote ke premium...', 'magenta', 'bounce');
  const p = await promote(v.id);
  if (!p.ok) {
    sp2.fail(chalk.red('Promote gagal'));
    console.log(chalk.red('   Detail: ' + p.why));
    return;
  }
  sp2.succeed(chalk.green('Premium aktif!'));

  struk(email, p.orderId, v.uid, v.baru);

  console.log(chalk.yellow('📋 PERUBAHAN AKUN:'));
  console.log(chalk.white('  ✔ Status     : FREE → PREMIUM'));
  console.log(chalk.white('  ✔ Paket      : Annual Subscription'));
  console.log(chalk.white('  ✔ Order ID   : ' + p.orderId));
  console.log(chalk.white('  ✔ UID        : ' + v.uid));
  console.log(chalk.white('  ✔ Tipe akun  : ' + (v.baru ? 'Baru' : 'Lama')));
}

// ============ FLOW 2: EMAIL TEMP ============
async function flowEmailTemp() {
  title('MODE EMAIL TEMP (BULK)');

  const jumlahStr = (await ask(chalk.cyan('🔢 Mau bikin berapa akun? (1-10): '))).trim();
  const jumlah = parseInt(jumlahStr);
  if (isNaN(jumlah) || jumlah < 1 || jumlah > 10) {
    console.log(chalk.red('\n❌ Jumlah harus antara 1-10.'));
    return;
  }

  console.log(chalk.yellow(`\n⏳ Membuat ${jumlah} email temp...\n`));

  const daftarEmail = [];
  for (let i = 0; i < jumlah; i++) {
    const sp = spinner(`[${i + 1}/${jumlah}] Membuat email temp...`, 'cyan', 'dots');
    try {
      const temp = await buatTempMail();
      sp.succeed(chalk.green(`[${i + 1}/${jumlah}] ${temp.address}`));
      daftarEmail.push(temp);
    } catch (e) {
      sp.fail(chalk.red(`[${i + 1}/${jumlah}] Gagal buat email`));
    }
  }

  if (daftarEmail.length === 0) {
    console.log(chalk.red('\n❌ Gak ada email yang berhasil dibuat.'));
    return;
  }

  console.log(chalk.cyan('\n╔═════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('          DAFTAR EMAIL TEMP              ') + chalk.cyan('║'));
  console.log(chalk.cyan('╠═════════════════════════════════════════╣'));
  daftarEmail.forEach((t, i) => {
    console.log(chalk.cyan('║') + chalk.yellow(` [${i + 1}] `) + chalk.white(t.address.padEnd(35)) + chalk.cyan('║'));
  });
  console.log(chalk.cyan('╚═════════════════════════════════════════╝'));

  console.log(chalk.gray('\n💡 Buka inbox di browser (login langsung):'));
  daftarEmail.forEach((t, i) => {
    console.log(chalk.cyan(`  [${i + 1}] `) + chalk.blue.underline(t.webUrl));
  });

  const konfirm = (await ask(chalk.cyan('\n🚀 Lanjut proses semua akun ini? (y/n): '))).trim().toLowerCase();
  if (konfirm !== 'y') {
    console.log(chalk.gray('Dibatalkan.'));
    return;
  }

  console.log(chalk.yellow('\n⏳ Memproses semua akun...'));

  const hasil = [];
  const mulaiTotal = Date.now();

  for (let i = 0; i < daftarEmail.length; i++) {
    const t = daftarEmail[i];
    divider();
    console.log(chalk.white(`📧 [${i + 1}/${daftarEmail.length}] ${t.address}`));

    const mulai = Date.now();

    try {
      // STEP 1: Kirim link
      const sp1 = spinner('  Kirim magic link...', 'yellow', 'dots');
      const link = await sendLink(t.address);
      if (!link.ok) {
        sp1.fail(chalk.red('  Gagal kirim link'));
        hasil.push({ email: t.address, ok: false, why: link.why });
        continue;
      }
      sp1.succeed(chalk.green('  Magic link terkirim'));

      // STEP 2: Tunggu inbox
      const sp2 = spinner('  Menunggu email masuk...', 'blue', 'arc');
      let rawLink = null;
      for (let j = 0; j < 30; j++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const emails = await cekInbox(t.client, t.token);
          if (emails && emails.length > 0) {
            const body = (emails[0].body || '') + ' ' + (emails[0].html || '');
            const match = body.match(/https?:\/\/[^\s"<>]+oobCode=[^\s"<>]+/i);
            if (match) { rawLink = match[0]; break; }
          }
        } catch {}
        sp2.text = chalk.blue(`  Menunggu email... (${(j + 1) * 3}s)`);
      }
      if (!rawLink) {
        sp2.fail(chalk.red('  Timeout — email gak masuk'));
        hasil.push({ email: t.address, ok: false, why: 'Timeout' });
        continue;
      }
      sp2.succeed(chalk.green('  Link verifikasi ketemu'));

      // STEP 3: Verifikasi
      const sp3 = spinner('  Verifikasi akun...', 'blue', 'bounce');
      const v = await verify(t.address, rawLink);
      if (!v.ok) {
        sp3.fail(chalk.red('  Verifikasi gagal'));
        hasil.push({ email: t.address, ok: false, why: v.why });
        continue;
      }
      sp3.succeed(chalk.green('  Login OK — UID: ' + v.uid));

      // STEP 4: Promote
      const sp4 = spinner('  Promote premium...', 'magenta', 'circle');
      const p = await promote(v.id);
      if (!p.ok) {
        sp4.fail(chalk.red('  Promote gagal'));
        hasil.push({ email: t.address, ok: false, why: p.why });
        continue;
      }
      sp4.succeed(chalk.green('  Premium aktif — ' + p.orderId));

      const durasi = formatDuration(Date.now() - mulai);
      console.log(chalk.gray('  ⏱ Selesai dalam ' + durasi));

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

  // ============ RINGKASAN ============
  const totalDurasi = formatDuration(Date.now() - mulaiTotal);
  const sukses = hasil.filter(h => h.ok);
  const gagal = hasil.filter(h => !h.ok);

  console.log('\n');
  console.log(chalk.cyan('╔═══════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('           RINGKASAN HASIL AKHIR                   ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════╝\n'));

  console.log(chalk.green(`  ✅ Sukses : ${sukses.length}/${hasil.length}`));
  console.log(chalk.red(`  ❌ Gagal  : ${gagal.length}/${hasil.length}`));
  console.log(chalk.gray(`  ⏱ Total  : ${totalDurasi}\n`));

  if (sukses.length > 0) {
    console.log(chalk.cyan('┌─── ✅ AKUN BERHASIL ──────────────────────────────┐'));
    sukses.forEach((h, i) => {
      console.log(chalk.white(`\n  [${i + 1}] ${h.email}`));
      console.log(chalk.gray('      ├─ Status  : FREE → PREMIUM ✅'));
      console.log(chalk.gray('      ├─ Paket   : Annual Subscription'));
      console.log(chalk.gray('      ├─ Order   : ' + h.orderId));
      console.log(chalk.gray('      ├─ UID     : ' + h.uid));
      console.log(chalk.gray('      ├─ Tipe    : ' + (h.baru ? 'Baru' : 'Lama')));
      console.log(chalk.gray('      └─ Inbox   : ' + chalk.blue.underline(h.webUrl)));
    });
    console.log(chalk.cyan('\n└───────────────────────────────────────────────────┘'));
  }

  if (gagal.length > 0) {
    console.log(chalk.red('\n┌─── ❌ AKUN GAGAL ─────────────────────────────────┐'));
    gagal.forEach((h, i) => {
      console.log(chalk.white(`  [${i + 1}] ${h.email}`));
      console.log(chalk.red('      └─ Error: ' + h.why));
    });
    console.log(chalk.red('└───────────────────────────────────────────────────┘'));
  }

  console.log(chalk.yellow('\n💡 Simpan info di atas sebelum email temp expired (1 jam).'));
}

// ============ MAIN LOOP ============
async function main() {
  buatRL();

  while (true) {
    console.clear();
    banner();
    menu();

    let pilih;
    try {
      pilih = (await ask(chalk.cyan('\n👉 Pilih (1/2/3): '))).trim();
    } catch (e) {
      break;
    }

    if (pilih === '1') {
      try { await flowEmailSendiri(); } catch (e) { console.log(chalk.red('\n❌ ' + e.message)); }
      await pause();
    } else if (pilih === '2') {
      try { await flowEmailTemp(); } catch (e) { console.log(chalk.red('\n❌ ' + e.message)); }
      await pause();
    } else if (pilih === '3') {
      console.log(chalk.gray('\n👋 Keluar. Makasih, Radit.\n'));
      rl.close();
      process.exit(0);
    } else {
      console.log(chalk.red('\n❌ Pilihan gak valid. Coba lagi.'));
      await new Promise(r => setTimeout(r, 1200));
    }
  }
}

// ============ ERROR HANDLER GLOBAL ============
process.on('uncaughtException', (e) => {
  console.log(chalk.red('\n💥 Uncaught Error: ' + e.message));
});
process.on('unhandledRejection', (e) => {
  console.log(chalk.red('\n💥 Unhandled Promise: ' + (e?.message || e)));
});
process.on('SIGINT', () => {
  console.log(chalk.gray('\n\n👋 Ctrl+C — keluar.\n'));
  process.exit(0);
});

main();
