const { TempMail } = require('tempmail.lol');

async function buatTempMail() {
  const tempmail = new TempMail();
  const inbox = await tempmail.createInbox();
  return {
    address: inbox.address,
    token: inbox.token,
    client: tempmail,
    webUrl: `https://tempmail.lol/inbox/${inbox.token}`,
    createdAt: new Date()
  };
}

async function cekInbox(client, token) {
  try {
    return await client.checkInbox(token);
  } catch {
    return [];
  }
}

module.exports = { buatTempMail, cekInbox };
