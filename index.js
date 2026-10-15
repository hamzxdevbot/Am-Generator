const readline = require('readline');
const chalk = require('chalk');
const { banner, menu, title } = require('./lib/loading');
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

const tunggu = (ms) => new Promise(r => setTimeout(r, ms));
const line = (c = 'gray') => console.log(chalk[c]('─'.repeat(50)));

// ============ FLOW: EMAIL SENDIRI ============
async function flow() {
  title('AKTIVASI PREMIUM');

  // EMAIL
  const email = await tanya(chalk.cyan('📧 Email Alight Motion: '));
  if (!email || !email.includes('@')) return console.log(chalk.red('\n❌ Email gak valid.'));

  // STEP 1
  console.log('');
  line('gray');
  console.log(chalk.yellow('⏳ [1/3] Mengirim magic link...'));
  let link;
  try { link = await sendLink(email); }
  catch (e) { return console.log(chalk.red('❌ Error: ' + e.message)); }

  if (!link.ok) return console.log(chalk.red('❌ Gagal: ' + link.why));
  console.log(chalk.green('✅ Link terkirim!'));
  console.log(chalk.gray('   → Cek inbox / spam: ' + email));

  // INPUT LINK
  console.log('');
  console.log(chalk.white.bold('📩 Buka email, klik link verifikasi.'));
  console.log(chalk.gray('   Kalau ada halaman "continue", copy URL-nya.'));
  const raw = await tanya(chalk.cyan('\n🔗 Paste link / oobCode: '));
  if (!raw) return console.log(chalk.red('\n❌ Link kosong.'));

  // STEP 2
  console.log('');
  line('gray');
  console.log(chalk.blue('⏳ [2/3] Verifikasi akun...'));
  let v;
  try { v = await verify(email, raw); }
  catch (e) { return console.log(chalk.red('❌ Error: ' + e.message)); }

  if (!v.ok) return console.log(chalk.red('❌ Gagal: ' + v.why));
  console.log(chalk.green('✅ Login OK'));
  console.log(chalk.gray('   → UID   : ' + v.uid));
  console.log(chalk.gray('   → Akun  : ' + (v.baru ? 'Baru' : 'Lama')));

  // STEP 3
  console.log('');
  line('gray');
  console.log(chalk.magenta('⏳ [3/3] Aktivasi premium...'));
  let p;
  try { p = await promote(v.id); }
  catch (e) { return console.log(chalk.red('❌ Error: ' + e.message)); }

  if (!p.ok) return console.log(chalk.red('❌ Gagal: ' + p.why));
  console.log(chalk.green('✅ Premium aktif!'));

  // STRUK
  struk(email, p.orderId, v.uid, v.baru);

  // RINGKASAN
  console.log(chalk.yellow('📋 Perubahan akun:'));
  console.log(chalk.white('   ✔ Status   : ') + chalk.green('FREE → PREMIUM'));
  console.log(chalk.white('   ✔ Paket    : ') + chalk.cyan('Annual Subscription'));
  console.log(chalk.white('   ✔ Order ID : ') + chalk.white(p.orderId));
  console.log(chalk.white('   ✔ UID      : ') + chalk.white(v.uid));
  console.log(chalk.white('   ✔ Tipe     : ') + chalk.white(v.baru ? 'Baru' : 'Lama'));
  console.log('');
}

// ============ MAIN ============
async function main() {
  while (true) {
    console.clear();
    banner();
    menu();

    const p = await tanya(chalk.cyan('\n👉 Pilih (1/2): '));

    if (p === '1') {
      try { await flow(); }
      catch (e) { console.log(chalk.red('\n❌ ' + e.message)); }
      await tanya(chalk.gray('\n⏎ Enter buat balik menu...'));
    } else if (p === '2') {
      console.log(chalk.gray('\n👋 Keluar. Makasih, Radit.\n'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n❌ Pilihan gak valid.'));
      await tunggu(1000);
    }
  }
}

process.on('uncaughtException', e => console.log(chalk.red('\n💥 ' + e.message)));
process.on('unhandledRejection', e => console.log(chalk.red('\n💥 ' + (e?.message || e))));
process.on('SIGINT', () => process.exit(0));

main();
