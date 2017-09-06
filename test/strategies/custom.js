const assert = require('assert');
const config = require('../../core/util.js').getConfig();
config.custom={
  my_custom_setting: 10,
};
const MockGekko=require("./mockGekko.js");
const mock=MockGekko(require('../../strategies/custom.js'));

<<<<<<< 587d094f1463cd385c73594a805eadd48b76d141
describe('strategies/custom', function() {

  const candles = [];
  for (var i = 0; i < 100; ++i) {
    candles.push({id: i, start: "2015-02-14T23:58:00.000Z", open: i, high: i, low: i - 1, close: i + 1})
  }
  it('should produce trades without error', function(done) {
    const tradeHistory = mock.inject(candles).getTradeHistory();
    assert(tradeHistory.length > 0);
    done();
  });
});
=======
const candles=[];
for (var i=0;i<100;++i) {
  candles.push({id: i,start:"2015-02-14T23:58:00.000Z",open:i,high:i,low:i-1,close:i+1})
}
const tradeHistory=mock.inject(candles).getTradeHistory();
assert(tradeHistory.length>0);

>>>>>>> Add unittest for strategies

