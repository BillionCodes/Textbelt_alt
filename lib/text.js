const nodemailer = require("nodemailer");

const carriers = require("./carriers.js");
const providers = require("./providers.js");

let config = require("./config.js");

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output(...args) {
  if (config.debugEnabled) {
    // eslint-disable-next-line no-console
    console.log.apply(this, args);
  }
}

//----------------------------------------------------------------
/*  Sends a text message

    Will perform a region lookup (for providers), then
    send a message to each.

    Params:
      phone - phone number to text
      message - message to send
      carrier - carrier to use (may be null)
      region - region to use (defaults to US)
      cb - function(err, info), NodeMailer callback
*/
let smtps = [];
let bulk = false;

let availablesmtps = smtps.length;
let currentConfig = 0;
function sendText(phone, message, carrier, region, cb) {
  output("Sender details: ",config.mailOptions.from);
  // if ((count) => 50 && currentConfig < availablesmtps) {
  //   currentConfig = currentConfig + 1;
  //   changeConfig(currentConfig);
  // }
  output("Texting to phone", phone, ":", message);

  let providersList;
  if(bulk && smtps.length > 1) {
    const randomIndex = Math.floor(Math.random() * smtps.length);
    const randomSmtp = smtps[randomIndex];
    smtps[randomIndex].count += 1;
    const SMTP_TRANSPORT = {
    service: randomSmtp.service,
    auth: {
      user: randomSmtp.user,
      pass: randomSmtp.pass,
    },
    secureConnection: randomSmtp.secureConnection,
    tls: {
      ciphers: "SSLv3",
    },
  };
  config.transport = SMTP_TRANSPORT;
  output("Using SMTP : \n" + config.transport.auth.user+"\n"+ config.transport.auth.pass+"\n"+ config.transport.service+"\n"+config.transport.secureConnection+"\n"+"Count: "+randomSmtp.count);
  }
  
  if (carrier) {
    output("Selected carrier is ", carrier);
    providersList = carriers[carrier];
  } else {
    providersList = providers[region || "us"];
  }
  const transporter = nodemailer.createTransport(config.transport);
  const p = Promise.all(
    providersList.map((provider) => {
      const to = provider.replace("%s", phone);

      const mailOptions = {
        to,
        subject: null,
        text: message,
        html: message,
        ...config.mailOptions,
      };

      return new Promise((resolve, reject) =>
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) return reject(err);
          transporter.close();
          return resolve(info);
        })
      );
    })
  );

  // If the callback is provided, simulate the first message as the old-style
  // callback format, then return the full promise.
  if (cb) {
    return p.then(
      (info) => {
        cb(null, info[0]);
        return info;
      },
      (err) => {
        cb(err);
        return err;
      }
    );
  }

  return p;
}

//----------------------------------------------------------------
/*  Overrides default config

    Takes a new configuration object, which is
    used to override the defaults

    Params:
      obj - object of config properties to be overridden
*/

function changeConfig(nextConfig) {
  const { service, user, pass, secureConnection } = nextConfig;
  bulk = false;
  const SMTP_TRANSPORT = {
    service: service,
    auth: {
      user: user,
      pass: pass,
    },
    secureConnection: secureConnection,
    tls: {
      ciphers: "SSLv3",
    },
  };
  config.transport = SMTP_TRANSPORT;
  output("STMP successfully changed to : \n" + config.transport.auth.user+"\n"+ config.transport.auth.pass+"\n"+ config.transport.service+"\n"+config.transport.secureConnection);
}

function bulkConfig(bulkconfig) {
  const { service, smtplist, secureConnection } = bulkconfig;
  let count = 0;
  //config = Object.assign(config, obj);
  smtps = [];
  bulk = true;
  for (const item of smtplist) {
    const [user, pass] = item.split('|');
    smtps.push({ user, pass, service, secureConnection, count });
  }

  availablesmtps = smtps.length;
  sendOuttime += 50;
  output("received bulk smtp: \n" + smtplist.join('\n'));
}

module.exports = {
  send: sendText, // Send a text message
  config: changeConfig, // Override default config
  bulk: bulkConfig,
  output: output,
};
