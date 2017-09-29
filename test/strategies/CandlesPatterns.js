const assert = require('assert');
const mocha = require('mocha');
const config = require('../../core/util.js').getConfig();
config.debug = true;
const MockGekko=require("./mockGekko.js");

const origin_candles=[
  {open: 120, close: 110, high: 120, low: 50},
  {open: 100, close: 110, high: 160, low: 100},
  {open: 100, close: 120, high: 160, low: 97},
  {open: 100, close: 120, high: 160, low: 100},
  {open: 120, close: 110, high: 120, low: 97},
  {open: 120, close: 100, high: 160, low: 97},
  {open: 100, close: 120, high: 123, low: 40},
  {open: 100, close: 120, high: 120, low: 100},
  {open: 120, close: 100, high: 120, low: 100},
  {open: 120, close: 100, high: 120, low: 100},
  {open: 100, close: 120, high: 160, low: 60},
  {open: 120, close: 100, high: 160, low: 60},
  {open: 120, close: 100, high: 160, low: 60},
  {open: 100, close: 100, high: 130, low: 81},
  {open: 100, close: 101, high: 130, low: 81},
  {open: 101, close: 100, high: 130, low: 81},
  {open: 100, close: 100, high: 170, low: 30},
  {open: 100, close: 101, high: 170, low: 30},
  {open: 101, close: 100, high: 170, low: 30},
  {open: 100, close: 100, high: 102, low: 30},
  {open: 100, close: 102, high: 102, low: 30},
  {open: 102, close: 100, high: 102, low: 30},
  {open: 100, close: 100, high: 170, low: 100},
  {open: 100, close: 102, high: 170, low: 100},
  {open: 102, close: 100, high: 170, low: 100},
  {open: 100, close: 50, high: 110, low: 40},
  {open: 45, close: 110, high: 120, low: 40},
  {open: 45, close: 110, high: 110, low: 45},
  {open: 100, close: 40, high: 100, low: 40},
  {open: 110, close: 100, high: 150, low: 50},
  {open: 100, close: 90, high: 100, low: 90},
  {open: 90, close: 80, high: 90, low: 80},
  {open: 100, close: 110, high: 110, low: 50},
  {open: 110, close: 100, high: 150, low: 50},
  {open: 100, close: 90, high: 100, low: 90},
  {open: 90, close: 80, high: 90, low: 80},
  {open: 110, close: 100, high: 110, low: 50},
  {open: 30, close: 90, high: 90, low: 30},
  {open: 90, close: 100, high: 100, low: 90},
  {open: 100, close: 110, high: 110, low: 100},
  {open: 110, close: 120, high: 120, low: 50},
  {open: 30, close: 90, high: 90, low: 30},
  {open: 90, close: 100, high: 100, low: 90},
  {open: 100, close: 110, high: 110, low: 100},
  {open: 120, close: 110, high: 120, low: 50},
  {open: 100, close: 150, high: 150, low: 100},
  {open: 160, close: 90, high: 160, low: 90},
  {open: 150, close: 100, high: 150, low: 100},
  {open: 90, close: 160, high: 160, low: 90},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 10, close: 150, high: 150, low: 10},
  {open: 160, close: 170, high: 175, low: 155},
  {open: 150, close: 100, high: 150, low: 100},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 50, close: 150, high: 150, low: 50},
  {open: 170, close: 160, high: 175, low: 155},
  {open: 150, close: 100, high: 150, low: 100},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 200, close: 120, high: 200, low: 120},
  {open: 110, close: 100, high: 115, low: 95},
  {open: 120, close: 160, high: 160, low: 120},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 10, close: 200, high: 200, low: 10},
  {open: 160, close: 120, high: 160, low: 120},
  {open: 100, close: 110, high: 115, low: 95},
  {open: 120, close: 160, high: 160, low: 120}
];

var expectedTrades = [
  {"price":110,"amount":-1,"date":"2015-01-01 01:00:00","profit":0},
  {"price":100,"amount":1,"date":"2015-01-01 05:00:00","profit":-10},
  {"price":120,"amount":-1,"date":"2015-01-01 06:00:00","profit":0},
  {"price":100,"amount":1,"date":"2015-01-01 08:00:00","profit":-20},
  {"price":120,"amount":-1,"date":"2015-01-01 10:00:00","profit":0},
  {"price":100,"amount":1,"date":"2015-01-01 11:00:00","profit":-20},
  {"price":101,"amount":-1,"date":"2015-01-01 14:00:00","profit":0},
  {"price":100,"amount":1,"date":"2015-01-01 15:00:00","profit":-1},
  {"price":101,"amount":-1,"date":"2015-01-01 17:00:00","profit":0},
	{"price":100,"amount":1,"date":"2015-01-01 18:00:00","profit":-1},
	{"price":102,"amount":-1,"date":"2015-01-01 20:00:00","profit":0},
	{"price":100,"amount":1,"date":"2015-01-01 21:00:00","profit":-2},
	{"price":102,"amount":-1,"date":"2015-01-01 23:00:00","profit":0},
	{"price":100,"amount":1,"date":"2015-01-02 00:00:00","profit":-2},
	{"price":110,"amount":-1,"date":"2015-01-02 02:00:00","profit":0},
	{"price":40,"amount":1,"date":"2015-01-02 04:00:00","profit":-70},
	{"price":110,"amount":-1,"date":"2015-01-02 08:00:00","profit":0},
	{"price":80,"amount":1,"date":"2015-01-02 11:00:00","profit":-30},
	{"price":90,"amount":-1,"date":"2015-01-02 13:00:00","profit":0},
	{"price":110,"amount":1,"date":"2015-01-02 20:00:00","profit":20},
	{"price":150,"amount":-1,"date":"2015-01-02 21:00:00","profit":0},
	{"price":90,"amount":1,"date":"2015-01-02 22:00:00","profit":-60},
	{"price":160,"amount":-1,"date":"2015-01-03 00:00:00","profit":0},
	{"price":100,"amount":1,"date":"2015-01-03 04:00:00","profit":-60},
	{"price":200,"amount":-1,"date":"2015-01-03 05:00:00","profit":0},
	{"price":100,"amount":1,"date":"2015-01-03 08:00:00","profit":-100},
	{"price":200,"amount":-1,"date":"2015-01-03 09:00:00","profit":0},
	{"price":120,"amount":1,"date":"2015-01-03 12:00:00","profit":-80},
	{"price":160,"amount":-1,"date":"2015-01-03 14:00:00","profit":0},
	{"price":120,"amount":1,"date":"2015-01-03 18:00:00","profit":-40},
	{"price":160,"amount":-1,"date":"2015-01-03 20:00:00","profit":0}
	];

describe('strategies/CandlesPatterns', function() {

  it('should produce trades without error', function(done) {
    config.CandlesPatterns={
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'average',     // 'max', 'average', 'median' or 'fixed'
      persistence: 0,
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    };
    const mock=MockGekko(require('../../strategies/CandlesPatterns.js'));
    const start = moment("2015-01-01");
    const candles = [];

    for (var i = 0; i < origin_candles.length; ++i) {
      origin_candles[i].start=start.format('YYYY-MM-DD HH:mm:ss');
      candles.push(origin_candles[i]);
      start.add(1, "hour")
    }
    const tradesHistory = mock.inject(candles).getTradeHistory();
    assert(tradesHistory.length > 0);
    //console.dir(tradesHistory);
    assert.deepEqual(tradesHistory, expectedTrades);
    done();
  });

  it('should manage the "persistence" of trend when confirmed',function(done) {
    config.CandlesPatterns={
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'average',     // 'max', 'average', 'median' or 'fixed'
      persistence: 1,
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    };
    const mock=MockGekko(require('../../strategies/CandlesPatterns.js'));
    const start = moment("2015-01-01");
    const candles = [];
    const test_candles=[
      {open: 120, close: 110, high: 120, low: 50},
      {open: 100, close: 110, high: 160, low: 100},
      ];
    for (var i = 0; i < test_candles.length; ++i) {
      test_candles[i].start=start.format('YYYY-MM-DD HH:mm:ss');
      candles.push(test_candles[i]);
      start.add(1, "hour")
    }
    var tradesHistory = mock.inject(test_candles).getTradeHistory();
    assert(tradesHistory.length == 0);
    test_candles.push({open: 100, close: 110, high: 160, low: 100, start:start.format('YYYY-MM-DD HH:mm:ss')});
    tradesHistory = mock.inject(test_candles).getTradeHistory();
    var expectedTrades=[ { price: 110, amount: -1, date: '2015-01-01 02:00:00', profit: 0 } ];
    assert.deepEqual(tradesHistory, expectedTrades);
    done();
  });

  it('should manage the "persistence" of trend when not confirmed',function(done) {
    config.CandlesPatterns={
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'average',     // 'max', 'average', 'median' or 'fixed'
      persistence: 1,
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    };
    const mock=MockGekko(require('../../strategies/CandlesPatterns.js'));
    const start = moment("2015-01-01");
    const candles = [];
    const test_candles=[
      {open: 120, close: 110, high: 120, low: 50},
      {open: 100, close: 110, high: 160, low: 100},
    ];
    for (var i = 0; i < test_candles.length; ++i) {
      test_candles[i].start=start.format('YYYY-MM-DD HH:mm:ss');
      candles.push(test_candles[i]);
      start.add(1, "hour")
    }
    var tradesHistory = mock.inject(test_candles).getTradeHistory();
    assert(tradesHistory.length == 0);
    test_candles.push({open: 110, close: 100, high: 160, low: 100, start:start.format('YYYY-MM-DD HH:mm:ss')});
    tradesHistory = mock.inject(test_candles).getTradeHistory();
    assert.deepEqual(tradesHistory, []);
    done();
  });
});

