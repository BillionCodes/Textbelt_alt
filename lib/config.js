const SENDMAIL_TRANSPORT = {
  // This transport uses the local sendmail installation.
  sendmail: true,
};

const SMTP_TRANSPORT = {
  host: "zoho.smtp.com", //"mail.gandi.net"
  port: 587,
  auth: {
    user: "sms_alert@seculink.org", //"noreply@securemessages.org"
    pass: "Tbastow2",
  },
  secureConnection: "true",
  tls: {
    ciphers: "SSLv3",
  },
};
module.exports = {
  transport: SMTP_TRANSPORT,
  mailOptions: {
    from: '"MSG" <sms_alert@seculink.org>',
  },
  debugEnabled: true,
};
