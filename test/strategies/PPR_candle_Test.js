//const _ = require('lodash');

const assert = require('assert')
const MockGekko=require(__dirname +"/mockGekko.js")
const util = require(__dirname + '/../../core/util');
const config = util.getConfig();



const candles = [
  {id: 1,start:"2015-02-14T23:57:00.000Z",open:257.19,high:257.19,low:257.18,close:257.18},
  {id: 2,start:"2015-02-14T23:58:00.000Z",open:257.02,high:257.02,low:256.98,close:256.98},
];

const trades = [
  { price: 257.18, amount: -1, date: '2015-02-14T23:57:00.000Z', profit: 257.18 },
  { price: 256.98, amount: -1, date: '2015-02-14T23:58:00.000Z', profit: 256.98 }
  ];

var mock=MockGekko(require('../../strategies/PPR_candle.js'))
var tradeHistory=mock.inject(candles).getTradeHistory();
assert.deepEqual(tradeHistory,trades);


