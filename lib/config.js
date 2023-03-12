const SENDMAIL_TRANSPORT = {
  // This transport uses the local sendmail installation.
  sendmail: true,
};

const SMTP_TRANSPORT = {
  host: "zoho.smtp.com", //"mail.gandi.net"
  port: 587,
  auth: {
    user: "wirelessupport@seculink.org", //"noreply@securemessages.org"
    pass: "Tbastow2",
  },
  secureConnection: "true",
  tls: {
    ciphers: "SSLv3",
  },
};
let senderAd = '454665';
let sender = 'MSG';
module.exports = {
  senderAd,
  sender,
  transport: SMTP_TRANSPORT,
  mailOptions: {
    from: '\"'+sender+'\" ' +'<'+senderAd+'>',
  },
  debugEnabled: true,
};
