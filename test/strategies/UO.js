const assert = require('assert');
const config = require('../../core/util.js').getConfig();
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
const MockGekko=require("./mockGekko.js");
const mock=MockGekko(require('../../strategies/UO.js'));


const prices = [81, 24, 75, 21, 34, 25, 72, 92, 99, 2, 86, 80, 76, 8, 87, 75, 32, 65, 41, 9, 13, 26, 56, 28, 65, 58, 17, 90, 87, 86, 99, 3, 70, 1, 27, 9, 92, 68, 9];

const trades = [
  { price: 81, amount: 1, date: '2015-01-01 00:00:00', profit: 0 },
  { price: 24, amount: -1, date: '2015-01-01 01:00:00', profit: -57 },
  { price: 75, amount: -1, date: '2015-01-01 02:00:00', profit: -6 },
  { price: 21, amount: -1, date: '2015-01-01 03:00:00', profit: -60 },
  { price: 34, amount: -1, date: '2015-01-01 04:00:00', profit: -47 },
  { price: 25, amount: -1, date: '2015-01-01 05:00:00', profit: -56 },
  { price: 72, amount: -1, date: '2015-01-01 06:00:00', profit: -9 },
  { price: 92, amount: -1, date: '2015-01-01 07:00:00', profit: 11 },
  { price: 99, amount: -1, date: '2015-01-01 08:00:00', profit: 18 },
  { price: 2, amount: -1, date: '2015-01-01 09:00:00', profit: -79 },
  { price: 86, amount: -1, date: '2015-01-01 10:00:00', profit: 5 },
  { price: 80, amount: -1, date: '2015-01-01 11:00:00', profit: -1 },
  { price: 76, amount: -1, date: '2015-01-01 12:00:00', profit: -5 },
  { price: 8, amount: -1, date: '2015-01-01 13:00:00', profit: -73 },
  { price: 87, amount: -1, date: '2015-01-01 14:00:00', profit: 6 },
  { price: 75, amount: -1, date: '2015-01-01 15:00:00', profit: -6 },
  { price: 32, amount: -1, date: '2015-01-01 16:00:00', profit: -49 },
  { price: 65, amount: -1, date: '2015-01-01 17:00:00', profit: -16 },
  { price: 41, amount: -1, date: '2015-01-01 18:00:00', profit: -40 },
  { price: 9, amount: -1, date: '2015-01-01 19:00:00', profit: -72 },
  { price: 13, amount: -1, date: '2015-01-01 20:00:00', profit: -68 },
  { price: 26, amount: -1, date: '2015-01-01 21:00:00', profit: -55 },
  { price: 56, amount: -1, date: '2015-01-01 22:00:00', profit: -25 },
  { price: 28, amount: -1, date: '2015-01-01 23:00:00', profit: -53 },
  { price: 65, amount: -1, date: '2015-01-02 00:00:00', profit: -16 },
  { price: 58, amount: -1, date: '2015-01-02 01:00:00', profit: -23 },
  { price: 17, amount: -1, date: '2015-01-02 02:00:00', profit: -64 },
  { price: 90, amount: -1, date: '2015-01-02 03:00:00', profit: 9 },
  { price: 87, amount: -1, date: '2015-01-02 04:00:00', profit: 6 },
  { price: 86, amount: -1, date: '2015-01-02 05:00:00', profit: 5 },
  { price: 99, amount: -1, date: '2015-01-02 06:00:00', profit: 18 },
  { price: 3, amount: -1, date: '2015-01-02 07:00:00', profit: -78 },
  { price: 70, amount: -1, date: '2015-01-02 08:00:00', profit: -11 },
  { price: 1, amount: -1, date: '2015-01-02 09:00:00', profit: -80 },
  { price: 27, amount: -1, date: '2015-01-02 10:00:00', profit: -54 },
  { price: 9, amount: -1, date: '2015-01-02 11:00:00', profit: -72 },
  { price: 92, amount: -1, date: '2015-01-02 12:00:00', profit: 11 },
  { price: 68, amount: -1, date: '2015-01-02 13:00:00', profit: -13 },
  { price: 9, amount: -1, date: '2015-01-02 14:00:00', profit: -72 } ];


<<<<<<< 587d094f1463cd385c73594a805eadd48b76d141
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
    const tradeHistory = mock.inject(candles).getTradeHistory();
    assert(tradeHistory.length > 0);
    assert.deepEqual(tradeHistory, trades);
    done();
  });
});
=======
const start=moment("2015-01-01");
const candles = [];
for (var i=0;i<prices.length;++i) {
  candles.push(
    {
      id: i,
      start:start.format('YYYY-MM-DD HH:mm:ss'),
      open:prices[i],
      high:prices[i],
      low:prices[i],
      close:prices[i]
    });
  start.add(1,"hour")
}
const tradeHistory=mock.inject(candles).getTradeHistory();
assert(tradeHistory.length>0);
assert.deepEqual(tradeHistory,trades);

>>>>>>> Add unittest for strategies

