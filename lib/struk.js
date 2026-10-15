function struk(email, orderId, uid, isNew) {
  const now = new Date();
  const tanggal = now.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const W = 40;
  const line = '─'.repeat(W);
  const center = (t) => {
    const pad = Math.max(0, Math.floor((W - t.length) / 2));
    return ' '.repeat(pad) + t + ' '.repeat(Math.max(0, W - pad - t.length));
  };
  const row = (k, v) => {
    const left = ` ${k}`.padEnd(12);
    const isi = (left + ': ' + String(v)).slice(0, W).padEnd(W);
    return '│' + isi + '│';
  };

  console.log('\n');
  console.log('┌' + line + '┐');
  console.log('│' + center('ALIGHT MOTION PREMIUM') + '│');
  console.log('│' + center('✦ OFFICIAL RECEIPT ✦') + '│');
  console.log('├' + line + '┤');
  console.log(row('Pembeli', 'Radit'));
  console.log(row('Email', email));
  console.log(row('UID', uid));
  console.log(row('Order', orderId));
  console.log(row('Paket', 'Annual Subscription'));
  console.log(row('Akun', isNew ? 'Baru' : 'Lama'));
  console.log(row('Status', 'ACTIVE ✅'));
  console.log(row('Waktu', tanggal));
  console.log('├' + line + '┤');
  console.log('│' + center('Terima kasih, Radit!') + '│');
  console.log('│' + center('Enjoy your premium 🎉') + '│');
  console.log('└' + line + '┘');
  console.log('\n');
}

module.exports = struk;