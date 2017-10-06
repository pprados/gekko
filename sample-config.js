// Everything is explained here:
// @link https://gekko.wizb.it/docs/commandline/plugins.html
const fs = require('fs');

var config = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.debug = true; // for additional logging / debugging
config.silent = false;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.watch = {

  // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
  //exchange: 'poloniex', currency: 'USDT', asset: 'BTC',
  exchange: 'kraken', currency: 'EUR', asset: 'XBT',

  // You can set your own tickrate (refresh rate).
  // If you don't set it, the defaults are 2 sec for
  // okcoin and 20 sec for all other exchanges.
  // tickrate: 20
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING TRADING ADVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.tradingAdvisor = {
  enabled: true,
  method: 'MACD',
  candleSize: 1,
  historySize: 3,
  adapter: 'sqlite',
  talib: {
    enabled: false,
    version: '1.0.2'
  }
}

// Exponential Moving Averages settings:
config.DEMA = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 10,
  long: 21,
  // amount of candles to remember and base initial EMAs on
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025
  }
};

// MACD settings:
config.MACD = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 10,
  long: 21,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// PPO settings:
config.PPO = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 12,
  long: 26,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 2
  }
};

// Uses one of the momentum indicators but adjusts the thresholds when PPO is bullish or bearish
// Uses settings from the ppo and momentum indicator config block
config.varPPO = {
  momentum: 'TSI', // RSI, TSI or UO
  thresholds: {
    // new threshold is default threshold + PPOhist * PPOweight
    weightLow: 120,
    weightHigh: -120,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 0
  }
};

// RSI settings:
config.RSI = {
  interval: 14,
  thresholds: {
    low: 30,
    high: 70,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// TSI settings:
config.TSI = {
  short: 13,
  long: 25,
  thresholds: {
    low: -25,
    high: 25,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// Ultimate Oscillator Settings
config.UO = {
  first: {weight: 4, period: 7},
  second: {weight: 2, period: 14},
  third: {weight: 1, period: 28},
  thresholds: {
    low: 30,
    high: 70,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// CCI Settings
config.CCI = {
    constant: 0.015, // constant multiplier. 0.015 gets to around 70% fit
    history: 90, // history size, make same or smaller than history
    thresholds: {
        up: 100, // fixed values for overbuy upward trajectory
        down: -100, // fixed value for downward trajectory
        persistence: 0 // filter spikes by adding extra filters candles
    }
};

// StochRSI settings
config.StochRSI = {
  interval: 3,
  thresholds: {
    low: 20,
    high: 80,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 3
  }
};


// custom settings:
config.custom = {
  my_custom_setting: 10,
}

config['talib-macd'] = {
  parameters: {
    optInFastPeriod: 10,
    optInSlowPeriod: 21,
    optInSignalPeriod: 9
  },
  thresholds: {
    down: -0.025,
    up: 0.025,
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// do you want Gekko to simulate the profit of the strategy's own advice?
config.paperTrader = {
  enabled: true,
  // report the profit in the currency or the asset?
  reportInCurrency: true,
  // start balance, on what the current balance is compared with
  simulationBalance: {
    // these are in the unit types configured in the watcher.
    asset: 1,
    currency: 100,
  },
  // how much fee in % does each trade cost?
  feeMaker: 0.15,
  feeTaker: 0.25,
  feeUsing: 'maker',
  // how much slippage/spread should Gekko assume per trade?
  slippage: 0.05,
}

config.performanceAnalyzer = {
  enabled: true,
  riskFreeReturn: 5
}

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `config.watch`.
config.trader = {
  enabled: false,
  key: '',
  secret: '',
  username: '', // your username, only required for specific exchanges.
  passphrase: '' // GDAX, requires a passphrase.
}

config.adviceLogger = {
  enabled: false,
  muteSoft: true // disable advice printout if it's soft
}

config.pushover = {
  enabled: false,
  sendPushoverOnStart: false,
  muteSoft: true, // disable advice printout if it's soft
  tag: '[GEKKO]',
  key: '',
  user: ''
}

// want Gekko to send a mail on buy or sell advice?
config.mailer = {
  enabled: false,       // Send Emails if true, false to turn off
  sendMailOnStart: true,    // Send 'Gekko starting' message if true, not if false

  email: '',    // Your Gmail address
  muteSoft: true, // disable advice printout if it's soft

  // You don't have to set your password here, if you leave it blank we will ask it
  // when Gekko's starts.
  //
  // NOTE: Gekko is an open source project < https://github.com/askmike/gekko >,
  // make sure you looked at the code or trust the maintainer of this bot when you
  // fill in your email and password.
  //
  // WARNING: If you have NOT downloaded Gekko from the github page above we CANNOT
  // guarantuee that your email address & password are safe!

  password: '',       // Your Gmail Password - if not supplied Gekko will prompt on startup.

  tag: '[GEKKO] ',      // Prefix all email subject lines with this

            //       ADVANCED MAIL SETTINGS
            // you can leave those as is if you
            // just want to use Gmail

  server: 'smtp.gmail.com',   // The name of YOUR outbound (SMTP) mail server.
  smtpauth: true,     // Does SMTP server require authentication (true for Gmail)
          // The following 3 values default to the Email (above) if left blank
  user: '',       // Your Email server user name - usually your full Email address 'me@mydomain.com'
  from: '',       // 'me@mydomain.com'
  to: '',       // 'me@somedomain.com, me@someotherdomain.com'
  ssl: true,        // Use SSL (true for Gmail)
  port: '',       // Set if you don't want to use the default port
}

config.pushbullet = {
    // sends pushbullets if true
  enabled: false,
    // Send 'Gekko starting' message if true
  sendMessageOnStart: true,
    // disable advice printout if it's soft
  muteSoft: true,
    // your pushbullet API key
  key: 'xxx',
    // your email, change it unless you are Azor Ahai
  email: 'jon_snow@westeros.org',
    // will make Gekko messages start mit [GEKKO]
  tag: '[GEKKO]'
};

config.ircbot = {
  enabled: false,
  emitUpdates: false,
  muteSoft: true,
  channel: '#your-channel',
  server: 'irc.freenode.net',
  botName: 'gekkobot'
}

config.telegrambot = {
  enabled: false,
  emitUpdates: false,
  token: 'YOUR_TELEGRAM_BOT_TOKEN',
  botName: 'gekkobot'
}

config.twitter = {
    // sends pushbullets if true
  enabled: false,
    // Send 'Gekko starting' message if true
  sendMessageOnStart: false,
    // disable advice printout if it's soft
  muteSoft: false,
  tag: '[GEKKO]',
    // twitter consumer key
  consumer_key: '',
    // twitter consumer secret
  consumer_secret: '',
    // twitter access token key
  access_token_key: '',
    // twitter access token secret
  access_token_secret: ''
};

config.xmppbot = {
  enabled: false,
  emitUpdates: false,
  client_id: 'jabber_id',
  client_pwd: 'jabber_pw',
  client_host: 'jabber_server',
  client_port: 5222,
  status_msg: 'I\'m online',
  receiver: 'jabber_id_for_updates'
}

config.campfire = {
  enabled: false,
  emitUpdates: false,
  nickname: 'Gordon',
  roomId: null,
  apiKey: '',
  account: ''
}

config.redisBeacon = {
  enabled: false,
  port: 6379, // redis default
  host: '127.0.0.1', // localhost
    // On default Gekko broadcasts
    // events in the channel with
    // the name of the event, set
    // an optional prefix to the
    // channel name.
  channelPrefix: '',
  broadcast: [
    'candle'
  ]
}

config.slack = {
  enabled: false,
  token: '',
  sendMessageOnStart: true,
  muteSoft: true,
  channel: '' // #tradebot
}

config.candleWriter = {
  enabled: false
}

config.adviceWriter = {
  enabled: false,
  muteSoft: true,
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING ADAPTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.adapter = 'sqlite';

config.sqlite = {
  path: 'plugins/sqlite',

  dataDirectory: 'history',
  version: 0.1,

  dependencies: []
}

  // Postgres adapter example config (please note: requires postgres >= 9.5):
config.postgresql = {
  path: 'plugins/postgresql',
  version: 0.1,
  connectionString: 'postgres://user:pass@localhost:5432', // if default port
  database: null, // if set, we'll put all tables into a single database.
  schema: 'public',
  dependencies: [{
    module: 'pg',
    version: '6.1.0'
  }]
}

// Mongodb adapter, requires mongodb >= 3.3 (no version earlier tested)
config.mongodb = {
  path: 'plugins/mongodb',
  version: 0.1,
  connectionString: 'mongodb://mongodb/gekko', // connection to mongodb server
  dependencies: [{
    module: 'mongojs',
    version: '2.4.0'
  }]
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html

config.backtest = {
//  daterange: 'scan',
  daterange: { from:"2017-01-01",to:"2017-03-01"},
  batchSize: 50
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING IMPORTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

config.importer = {
  daterange: {
    // NOTE: these dates are in UTC
    from: "2016-01-01 00:00:00"
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       CONFIGURING LABS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// To use the labs, indicate all the variables to change for each launch
// with a 'for' loop design.
// For each variable, add an object in patchs with
// - 'path' with the name of the variable (in config)
// - 'loop' with 3 simple pattern
//    [0] : to initialise the parameter (with '0', use to execute '{} = 0')
//    [1] : to check the end of the loop (with '< 3' use to execute '{} < 3'
//    [2] : to increment the parameter (with '+ 1' use to execute '{} = {} + 1'
// - or 'exloop' with extended pattern like
// {
//    path:"backtest.daterange",
//    exloop:[
//       '// init',
//       'moment(config.{}.to).isBefore("2017-03-07")',
//       'slideWindow(config.{},1, "day")',
//       '// const x=require(...)
//    ],
// }
//
// All the results are saved in 'file' with CSV format.
// To start, use 'node labgekko --backtest --config ...' in place of 'node gekko --backtest --config ...'
config.lab={
  enabled:true,
  file:"labs/"+config.tradingAdvisor.method+"-"+config.watch.currency+config.watch.asset+".csv",
  backTest : "2 month",
  duringTest: "1 month",
  slidingWindows: "1 week",
  maxDate: "2017-03-01", // Without maxDate, use the current date
  // Fields to add in CSV. Can be omitted or reorders
  fields:[
    "method",
    // "exchange","currency","asset",
    // "candleSize","historySize",
    "patchs",
    // "startTime","endTime","timespan",
    // "startPrice","endPrice",
    "market",
    "trades",
    // "startBalance","balance","profit",
    "relativeProfit",
    "relativeResult","percentResult"
  ],
  // Lists of modification to apply in config.
  patchs:[
    {
      path:"tradingAdvisor.candleSize",
      loop:["5","< 120","+5"],
    },
    { // 10
      path: "MACD.short",
      loop: ["5", "<= 15", "+ 5"], // Normal:10
    },
    { // 21
      path: "MACD.long",
      loop: ["16", "<= 26", "+ 5"], // Normal:21
    },
    { // 9
      path: "MACD.signal",
      loop: ["8", "<= 10", "+ 2"], // Normal:9
    },
    // Sample of complex loop with sliding window
    {
      path:"backtest.daterange",
      exloop:[
        'config.{}={from:"2017-01-01", to: "2017-03-01"}',
        'moment(config.{}.to).isBefore("2017-03-01")',
        'slidingWindow(config.{},1, "week")',
        '// require nothing in global scope',
      ],
    },
  ],
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// set this to true if you understand that Gekko will
// invest according to how you configured the indicators.
// None of the advice in the output is Gekko telling you
// to take a certain position. Instead it is the result
// of running the indicators you configured automatically.
//
// In other words: Gekko automates your trading strategies,
// it doesn't advice on itself, only set to true if you truly
// understand this.
//
// Not sure? Read this first: https://github.com/askmike/gekko/issues/201
config['I understand that Gekko only automates MY OWN trading strategies'] = false;

module.exports = config;
