const assert = require('assert');
const config = require('../../core/util.js').getConfig();
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
const MockGekko=require("./mockGekko.js");


const prices = [81, 24, 75, 21, 34, 25, 72, 92, 99, 2, 86, 80, 76, 8, 87, 75, 32, 65, 41, 9, 13, 26, 56, 28, 65, 58, 17, 90, 87, 86, 99, 3, 70, 1, 27, 9, 92, 68, 9];

const trades = [{"price":81,"amount":-1,"date":"2015-01-01 00:00:00","profit":0},
	{"price":24,"amount":-1,"date":"2015-01-01 01:00:00","profit":0},
	{"price":75,"amount":-1,"date":"2015-01-01 02:00:00","profit":0},
	{"price":21,"amount":-1,"date":"2015-01-01 03:00:00","profit":0},
	{"price":34,"amount":-1,"date":"2015-01-01 04:00:00","profit":0},
	{"price":25,"amount":-1,"date":"2015-01-01 05:00:00","profit":0},
	{"price":72,"amount":-1,"date":"2015-01-01 06:00:00","profit":0},
	{"price":92,"amount":-1,"date":"2015-01-01 07:00:00","profit":0},
	{"price":99,"amount":-1,"date":"2015-01-01 08:00:00","profit":0},
	{"price":2,"amount":-1,"date":"2015-01-01 09:00:00","profit":0},
	{"price":86,"amount":-1,"date":"2015-01-01 10:00:00","profit":0},
	{"price":80,"amount":-1,"date":"2015-01-01 11:00:00","profit":0},
	{"price":76,"amount":-1,"date":"2015-01-01 12:00:00","profit":0},
	{"price":8,"amount":-1,"date":"2015-01-01 13:00:00","profit":0},
	{"price":87,"amount":-1,"date":"2015-01-01 14:00:00","profit":0},
	{"price":75,"amount":-1,"date":"2015-01-01 15:00:00","profit":0},
	{"price":32,"amount":-1,"date":"2015-01-01 16:00:00","profit":0},
	{"price":65,"amount":-1,"date":"2015-01-01 17:00:00","profit":0},
	{"price":41,"amount":-1,"date":"2015-01-01 18:00:00","profit":0},
	{"price":9,"amount":-1,"date":"2015-01-01 19:00:00","profit":0},
	{"price":13,"amount":-1,"date":"2015-01-01 20:00:00","profit":0},
	{"price":26,"amount":-1,"date":"2015-01-01 21:00:00","profit":0},
	{"price":56,"amount":-1,"date":"2015-01-01 22:00:00","profit":0},
	{"price":28,"amount":-1,"date":"2015-01-01 23:00:00","profit":0},
	{"price":65,"amount":-1,"date":"2015-01-02 00:00:00","profit":0},
	{"price":58,"amount":-1,"date":"2015-01-02 01:00:00","profit":0},
	{"price":17,"amount":-1,"date":"2015-01-02 02:00:00","profit":0},
	{"price":90,"amount":-1,"date":"2015-01-02 03:00:00","profit":0},
	{"price":87,"amount":-1,"date":"2015-01-02 04:00:00","profit":0},
	{"price":86,"amount":-1,"date":"2015-01-02 05:00:00","profit":0},
	{"price":99,"amount":-1,"date":"2015-01-02 06:00:00","profit":0},
	{"price":3,"amount":-1,"date":"2015-01-02 07:00:00","profit":0},
	{"price":70,"amount":-1,"date":"2015-01-02 08:00:00","profit":0},
	{"price":1,"amount":-1,"date":"2015-01-02 09:00:00","profit":0},
	{"price":27,"amount":-1,"date":"2015-01-02 10:00:00","profit":0},
	{"price":9,"amount":-1,"date":"2015-01-02 11:00:00","profit":0},
	{"price":92,"amount":-1,"date":"2015-01-02 12:00:00","profit":0},
	{"price":68,"amount":-1,"date":"2015-01-02 13:00:00","profit":0},
	{"price":9,"amount":-1,"date":"2015-01-02 14:00:00","profit":0}];

describe('strategies/UO', function() {

  const start = moment("2015-01-01");
  const candles = [];
  for (var i = 0; i < prices.length; ++i) {
    candles.push(
      {
        id: i,
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        open: prices[i],
        high: prices[i],
        low: prices[i],
        close: prices[i]
      });
    start.add(1, "hour")
  }
  it('should produce trades without error', function(done) {
    const mock=MockGekko(require('../../strategies/varPPO.js'),config.varPPO);
    const tradeHistory = mock.inject(candles).getTradeHistory();
    assert(tradeHistory.length > 0);
    assert.deepEqual(tradeHistory, trades);
    done();
  });
});

