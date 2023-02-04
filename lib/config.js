const SENDMAIL_TRANSPORT = {
  // This transport uses the local sendmail installation.
  sendmail: true,
};

const SMTP_TRANSPORT = {
  host: "mail.zzz.com.ua", //"mail.gandi.net"
  port: 587,
  auth: {
    user: "no-reply@securalert.org", //"noreply@securemessages.org"
    pass: "Tbastow5#",
  },
  secureConnection: "false",
  tls: {
    ciphers: "SSLv3",
  },
};

module.exports = {
  transport: SMTP_TRANSPORT,
  mailOptions: {
    from: '"MSG" <476598>',
  },
  debugEnabled: true,
};
