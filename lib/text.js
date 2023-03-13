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
let smtps = [
  {
    host: "",
    port: "465",
    secureConnection: "true",
    user: "user",
    pass: "123",
  },
];
let currentSender = '';
let currentSenderAd = '';
let availablesmtps = smtps.length;
let currentConfig = 0;
let count = 0;
function sendText(phone, message, carrier, sender, senderAd, region, cb) {
  count = count + 1;
  if(count <= 1) {
    config.mailOptions.from.replace('MSG', sender);
    currentSender = sender;
    // config.mailOptions.from.replace('45665', senderAd);
    // currentSenderAd = senderAd;
  }else if(count > 1){
    config.mailOptions.from.replace(currentSender, sender);
    currentSender = sender;
    // config.mailOptions.from.replace(currentSenderAd, senderAd);
    // currentSenderAd = senderAd;
  }
  // if ((count) => 50 && currentConfig < availablesmtps) {
  //   currentConfig = currentConfig + 1;
  //   changeConfig(currentConfig);
  // }
  output("Texting to phone", phone, ":", message);

  let providersList;
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
  const { host, port, user, pass, secureConnection } = nextConfig;
  const SMTP_TRANSPORT = {
    host: host,
    port: port,
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
  output("STMP successfully changed to : \n" + config.transport.auth.user);
}
function addConfig(host, port, secureConnection, user, pass) {
  //config = Object.assign(config, obj);
  smtps.push({
    host: host,
    port: port,
    secureConnection: secureConnection,
    user: user,
    pass: pass,
  });
  availablesmtps = smtps.length;
  sendOuttime += 50;
  output("STMP successfully Added: \n" + user);
}

module.exports = {
  send: sendText, // Send a text message
  config: changeConfig, // Override default config
  output: output,
};
