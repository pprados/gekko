/**
 * Mock the gekko engine.
 * const mock=MockGekko(require('../../strategies/MACD.js'))
 * var tradeHistory=mock.inject(candles).getTradeHistory();
 * assert.deepEqual(tradeHistory,trades)
 */
const Base = require(__dirname +'/../../plugins/tradingAdvisor/baseTradingMethod.js');
const config = require('../../core/util.js').getConfig();

function MockGekkoForStrategy(strategy,settings,adviceCB) {

  if (adviceCB === undefined) {
    adviceCB = function(newPosition) {
      const candle=this.mock.candle;
      var trade;
      if (newPosition === 'short') {
        trade={price: candle.close, amount: +1, date: candle.start,profit:(candle.close-this.buyPrice)};
        this.buyPrice=0;
        this.mock.trades.push(trade);
      } else {
        trade={price: candle.close, amount: -1, date: candle.start,profit:0};
        this.buyPrice=candle.close;
        this.mock.trades.push(trade);
      }
    }
  }
  function MockGekko() {
    this.indicators={};
    this.settings=settings;
    this.buyPrice=0;
    this.mock={
      trades:[],
    };
    this.tradingAdvisor=config.tradingAdvisor;
  }
  MockGekko.prototype = strategy;
  if (strategy.init === undefined) {
    MockGekko.prototype.init=function() {}
  }
  if (strategy.update === undefined) {
    MockGekko.prototype.update=function() {}
  }
  if (strategy.log === undefined) {
    MockGekko.prototype.log=function() {}
  }
  if (strategy.check === undefined) {
    MockGekko.prototype.check=function() {}
  }
  MockGekko.prototype.addIndicator = Base.prototype.addIndicator;
  MockGekko.prototype.inject=function(candles) {
    this.init();

    for (var i=0;i<candles.length;++i) {
      const candle=candles[i];
      this.mock.candle=candle;
      for (const indicator in this.indicators) {
        this.indicators[indicator].update(candle);
      }
      this.update(candle);
      this.log(candle);
      this.check(candles[i]);
    }
    return this;
  };
  MockGekko.prototype.advice=adviceCB;
  MockGekko.prototype.getTradeHistory=function() {
    return this.mock.trades;
  };
  return new MockGekko();
}

module.exports = MockGekkoForStrategy;


