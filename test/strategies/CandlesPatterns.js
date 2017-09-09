const assert = require('assert');
const mocha = require('mocha');
const config = require('../../core/util.js').getConfig();
config.CandlesPatterns={
  scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
  strategy:'average',     // 'max', 'average', 'median' or 'fixed'
  dojiLimit:4/100,        // Doji is limited to 4% of the current scale
  shortLimit:15/100,      // Short body is limited to 15% of the current scale
  longLimit:20/100,       // Long body must be bigger of 20% of the current scale
  sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
  persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
};
config.debug = true;
const MockGekko=require("./mockGekko.js");
const mock=MockGekko(require('../../strategies/CandlesPatterns.js'));


const prices = [81, 24, 75, 21, 34, 25, 72, 92, 99, 2, 86, 80, 76, 8, 87, 75, 32, 65, 41, 9, 13, 26, 56, 28, 65, 58, 17, 90, 87, 86, 99, 3, 70, 1, 27, 9, 92, 68, 9];

const origin_candles=[
{open:100,close:110,high:110,low:50},
{open:100,close:110,high:160,low:100},
{open:100,close:120,high:160,low:97},
{open:100,close:120,high:160,low:100},
{open:120,close:100,high:160,low:97},
{open:100,close:120,high:123,low:40},
{open:100,close:120,high:120,low:100},
{open:120,close:100,high:120,low:100},
{open:100,close:120,high:160,low:60},
{open:120,close:100,high:160,low:60},
{open:100,close:100,high:130,low:81},
{open:100,close:102,high:130,low:81},
{open:102,close:100,high:130,low:81},
{open:100,close:100,high:170,low:30},
{open:100,close:102,high:170,low:30},
{open:102,close:100,high:170,low:30},
{open:100,close:100,high:102,low:30},
{open:100,close:102,high:102,low:30},
{open:102,close:100,high:102,low:30},
{open:100,close:100,high:170,low:100},
{open:100,close:102,high:170,low:100},
{open:102,close:100,high:170,low:100},
{open:100,close:50,high:110,low:40},
{open:45,close:110,high:120,low:40},
{open:45,close:110,high:110,low:45},
{open:100,close:40,high:100,low:40},
{open:110,close:100,high:110,low:100},
{open:100,close:90,high:100,low:90},
{open:90,close:80,high:90,low:80},
{open:100,close:110,high:110,low:50},
{open:110,close:100,high:110,low:100},
{open:100,close:90,high:100,low:90},
{open:90,close:80,high:90,low:80},
{open:110,close:100,high:110,low:50},
{open:80,close:90,high:90,low:80},
{open:90,close:100,high:100,low:90},
{open:100,close:110,high:110,low:100},
{open:110,close:120,high:120,low:50},
{open:80,close:90,high:90,low:80},
{open:90,close:100,high:100,low:90},
{open:100,close:110,high:110,low:100},
{open:120,close:110,high:120,low:50},
{open:100,close:150,high:150,low:100},
{open:160,close:90,high:160,low:90},
{open:150,close:100,high:150,low:100},
{open:90,close:160,high:160,low:90},
{open:100,close:150,high:150,low:100},
{open:160,close:170,high:175,low:155},
{open:150,close:100,high:150,low:100},
{open:100,close:150,high:150,low:100},
{open:170,close:160,high:175,low:155},
{open:150,close:100,high:150,low:100},
{open:160,close:120,high:160,low:120},
{open:110,close:100,high:115,low:95},
{open:120,close:160,high:160,low:120},
{open:160,close:120,high:160,low:120},
{open:100,close:110,high:115,low:95},
{open:120,close:160,high:160,low:120},
];

const trades = [ { price: 110,
  amount: -1, date: '2015-01-01 00:00:00', profit: 110 },
  { price: 100, amount: 1, date: '2015-01-01 04:00:00', profit: 0 },
  { price: 120, amount: -1, date: '2015-01-01 05:00:00', profit: 20 },
  { price: 100, amount: 1, date: '2015-01-01 07:00:00', profit: 0 },
  { price: 120, amount: -1, date: '2015-01-01 08:00:00', profit: 20 },
  { price: 100, amount: 1, date: '2015-01-01 09:00:00', profit: 0 },
  { price: 102, amount: -1, date: '2015-01-01 11:00:00', profit: 2 },
  { price: 100, amount: 1, date: '2015-01-01 12:00:00', profit: 0 },
  { price: 102, amount: -1, date: '2015-01-01 14:00:00', profit: 2 },
  { price: 100, amount: 1, date: '2015-01-01 15:00:00', profit: 0 },
  { price: 102, amount: -1, date: '2015-01-01 17:00:00', profit: 2 },
  { price: 100, amount: 1, date: '2015-01-01 18:00:00', profit: 0 },
  { price: 102, amount: -1, date: '2015-01-01 20:00:00', profit: 2 },
  { price: 100, amount: 1, date: '2015-01-01 21:00:00', profit: 0 },
  { price: 110, amount: -1, date: '2015-01-01 23:00:00', profit: 10 },
  { price: 40, amount: 1, date: '2015-01-02 01:00:00', profit: 0 },
  { price: 110, amount: -1, date: '2015-01-02 05:00:00', profit: 70 },
  { price: 100, amount: 1, date: '2015-01-02 06:00:00', profit: 0 },
  { price: 90, amount: -1, date: '2015-01-02 10:00:00', profit: -10 },
  { price: 110, amount: 1, date: '2015-01-02 17:00:00', profit: 0 },
  { price: 150, amount: -1, date: '2015-01-02 18:00:00', profit: 40 },
  { price: 90, amount: 1, date: '2015-01-02 19:00:00', profit: 0 },
  { price: 160, amount: -1, date: '2015-01-02 21:00:00', profit: 70 },
  { price: 100, amount: 1, date: '2015-01-03 00:00:00', profit: 0 },
  { price: 150, amount: -1, date: '2015-01-03 01:00:00', profit: 50 },
  { price: 100, amount: 1, date: '2015-01-03 03:00:00', profit: 0 },
  { price: 160, amount: -1, date: '2015-01-03 06:00:00', profit: 60 },
  { price: 120, amount: 1, date: '2015-01-03 07:00:00', profit: 0 },
  { price: 160, amount: -1, date: '2015-01-03 09:00:00', profit: 40 } ]
;

describe('strategies/CandlesPatterns', function() {

  const start = moment("2015-01-01");
  const candles = [];

  for (var i = 0; i < origin_candles.length; ++i) {
    origin_candles[i].start=start.format('YYYY-MM-DD HH:mm:ss');
    candles.push(origin_candles[i]);
    start.add(1, "hour")
  }
  it('should produce trades without error', function(done) {
    const tradeHistory = mock.inject(candles).getTradeHistory();
    assert(tradeHistory.length > 0);
    //console.dir(tradeHistory);
    assert.deepEqual(tradeHistory, trades);
    done();
  });
});

