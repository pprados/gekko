const should = require('chai').should()
const assert = require('assert');
const settings={
  scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
  strategy:'median',     // 'max', 'average', 'median' or 'fixed'
  dojiLimit:4/100,        // Doji is limited to 4% of the current scale
  shortLimit:15/100,      // Short body is limited to 15% of the current scale
  longLimit:50/100,       // Long body must be bigger of 20% of the current scale FIXME
  sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
  persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
};
const candlePattern=require("../../strategies/indicators/CandlesPatterns.js");


// -------------------------- Single candle --------------------------
describe('indicators/CandlesPatterns', function() {

  var indicator = new candlePattern(settings);
  it('should detect an "Hammer" pattern', function (done) {
    // ###
    // ###
    //  |
    //  |
    //  |
    //  |  (or Hanging man)
    indicator.update({open: 120, close: 110, high: 120, low: 50})
    indicator.name.should.equal('Hammer');
    done();
  });

  it('should detect an "InvertedHammer" pattern', function (done) {
    //  |
    //  |
    //  |
    //  |
    // ###
    // ###
    indicator.update({open: 100, close: 110, high: 160, low: 100})
    indicator.name.should.equal('InvertedHammer');
    done();
  });

  it('should detect a "LongUpperShadow" pattern', function (done) {
    //  |
    //  |
    //  |
    //  |
    // ###
    // ###
    // ###
    //  |
    indicator.update({open: 100, close: 120, high: 160, low: 97})
    indicator.name.should.equal('LongUpperShadow');
    assert(indicator.result > 0);
    indicator.update({open: 100, close: 120, high: 160, low: 100});
    indicator.name.should.equal('LongUpperShadow');
    assert(indicator.result > 0);
    indicator.update({open: 120, close: 110, high: 120, low: 97});
    indicator.update({open: 120, close: 100, high: 160, low: 97});
    indicator.name.should.equal('LongUpperShadow');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "LongLowerShadow" pattern', function (done) {
    //  |
    // ###
    // ###
    // ###
    //  |
    //  |
    //  |
    //  |
    indicator.update({open: 100, close: 120, high: 123, low: 40});
    indicator.name.should.equal('LongLowerShadow');
    assert(indicator.result > 0);
    done();
  });

  it('should detect a "Marubozu" pattern', function (done) {
    // ###  OOO
    // ###  O O
    // ###  OOO
    indicator.update({open: 100, close: 120, high: 120, low: 100});
    indicator.name.should.equal('Marubozu');
    assert(indicator.result > 0);
    indicator.update({open: 120, close: 100, high: 120, low: 100});
    indicator.update({open: 120, close: 100, high: 120, low: 100});
    indicator.name.should.equal('Marubozu');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "SpinningTop" pattern', function (done) {
    //  |    |
    //  |    |
    //  |    |
    // ###  OOO
    // ###  OOO
    //  |    |
    //  |    |
    //  |    |
    indicator.update({open: 100, close: 120, high: 160, low: 60});
    indicator.name.should.equal('SpinningTop');
    assert(indicator.result > 0);
    indicator.update({open: 120, close: 100, high: 160, low: 60});
    indicator.update({open: 120, close: 100, high: 160, low: 60});
    indicator.name.should.equal('SpinningTop');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "Doji" pattern', function (done) {
    //  |    |    |
    // -+-  ###  OOO
    //  |    |    |
    indicator.resetScale();
    indicator.update({open: 100, close: 100, high: 130, low: 81});
    indicator.name.should.equal('Doji');
    assert(indicator.result == 0);
    indicator.update({open: 100, close: 101, high: 130, low: 81});
    indicator.name.should.equal('Doji');
    assert(indicator.result > 0);
    indicator.update({open: 101, close: 100, high: 130, low: 81});
    indicator.name.should.equal('Doji');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "LongLeggedDoji" pattern', function (done) {
    //  |    |    |
    //  |    |    |
    //  |    |    |
    // -+-  ###  OOO
    //  |    |    |
    //  |    |    |
    //  |    |    |
    indicator.resetScale();
    indicator.update({open: 100, close: 100, high: 170, low: 30});
    indicator.name.should.equal('LongLeggedDoji');
    assert(indicator.result == 0);
    indicator.update({open: 100, close: 101, high: 170, low: 30});
    indicator.name.should.equal('LongLeggedDoji');
    assert(indicator.result > 0);
    indicator.update({open: 101, close: 100, high: 170, low: 30});
    indicator.name.should.equal('LongLeggedDoji');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "DragonflyDoji" pattern', function (done) {
    // -+-  ###  OOO
    //  |    |    |
    //  |    |    |
    //  |    |    |
    indicator.resetScale();
    indicator.update({open: 100, close: 100, high: 102, low: 30});
    indicator.name.should.equal('DragonflyDoji');
    assert(indicator.result == 0);
    indicator.update({open: 100, close: 102, high: 102, low: 30});
    indicator.name.should.equal('DragonflyDoji');
    assert(indicator.result > 0);
    indicator.update({open: 102, close: 100, high: 102, low: 30});
    indicator.name.should.equal('DragonflyDoji');
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "GravestoneDoji" pattern', function (done) {
    //  |    |    |
    //  |    |    |
    //  |    |    |
    // -+-  ###  OOO
    indicator.update({open: 100, close: 100, high: 170, low: 100});
    indicator.name.should.equal('GravestoneDoji');
    assert(indicator.result == 0);
    indicator.update({open: 100, close: 102, high: 170, low: 100});
    indicator.name.should.equal('GravestoneDoji');
    assert(indicator.result > 0);
    indicator.update({open: 102, close: 100, high: 170, low: 100});
    indicator.name.should.equal('GravestoneDoji');
    assert(indicator.result < 0);
    done();
  });

// -------------------------- Combine candles --------------------------

  it('should detect a "PiercingLine" pattern', function (done) {
    //    |
    //   ###  |
    //   ### OOO
    //---###-OOO---
    //   ### OOO
    //   ### OOO
    //    |  OOO
    //        |
    indicator.update({open: 100, close: 50, high: 110, low: 40});
    indicator.update({open: 45, close: 110, high: 120, low: 40});
    indicator.name.should.equal('PiercingLine');
    done();
  });

  it('should detect a "DarkCloudCover" pattern', function (done) {
    //        |
    //    |  ###
    //   OOO ###
    //   OOO ###
    //---OOO-###---
    //   OOO ###
    //   OOO  |
    //    |
    indicator.update({open: 45, close: 110, high: 110, low: 45});
    indicator.update({open: 100, close: 40, high: 100, low: 40});
    indicator.name.should.equal('DarkCloudCover');
    done();
  });

  it('should detect an "Hammer" pattern', function (done) {
    // |
    //###  |
    //### ###  |
    //### ### ###
    // |  ### ###
    //     |  ###
    //         |  ###   OOO
    //            ###   OOO
    //             |     |
    //             |  or |
    //             |     |
    indicator.resetScale();
    indicator.update({open: 110, close: 100, high: 150, low: 50});
    indicator.update({open: 100, close: 90, high: 100, low: 90});
    indicator.update({open: 90, close: 80, high: 90, low: 80});
    indicator.update({open: 100, close: 110, high: 110, low: 50})
    indicator.name.should.equal('Hammer'); // FIXME: doit etre la continuété de la baisse en open ?
    assert(indicator.result > 0);
    indicator.update({open: 110, close: 100, high: 150, low: 50});
    indicator.update({open: 100, close: 90, high: 100, low: 90});
    indicator.update({open: 90, close: 80, high: 90, low: 80});
    indicator.update({open: 110, close: 100, high: 110, low: 50})
    indicator.name.should.equal('Hammer'); // FIXME: doit etre la continuété de la baisse en open ?
    assert(indicator.result > 0);
    done();
  });

  it('should detect an "HangingMan" pattern', function (done) {
    //          |   ###   OOO
    //      |  OOO  ###   OOO
    //  |  OOO OOO   |     |
    // OOO OOO OOO   |  or |
    // OOO OOO  |    |     |
    // OOO  |
    //  |
    indicator.update({open: 30, close: 90, high: 90, low: 30});
    indicator.update({open: 90, close: 100, high: 100, low: 90});
    indicator.update({open: 100, close: 110, high: 110, low: 100});
    indicator.update({open: 110, close: 120, high: 120, low: 50})
    indicator.name.should.equal('HangingMan');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result < 0);
    indicator.update({open: 30, close: 90, high: 90, low: 30});
    indicator.update({open: 90, close: 100, high: 100, low: 90});
    indicator.update({open: 100, close: 110, high: 110, low: 100});
    indicator.update({open: 120, close: 110, high: 120, low: 50})
    indicator.name.should.equal('HangingMan');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result < 0);
    done();
  });

  it('should detect an "HaramiDown" pattern', function (done) {
    //       |
    //  |   ###
    // OOO  ###
    // OOO  ###
    // OOO  ###
    //  |   ###
    //      ###
    //       |
    indicator.update({open: 100, close: 150, high: 150, low: 100}); // Monte
    indicator.update({open: 160, close: 90, high: 160, low: 90});   // Puis baisse en englobant
    indicator.name.should.equal('HaramiDown');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result < 0);
    done();
  });

  it('should detect an "HaramiUp" pattern', function (done) {
    //       |
    //  |   OOO
    // ###  OOO
    // ###  OOO
    // ###  OOO
    //  |   OOO
    //      OOO
    //       |
    indicator.update({open: 150, close: 100, high: 150, low: 100}); // Descend
    indicator.update({open: 90, close: 160, high: 160, low: 90});   // Puis monte en englobant
    indicator.name.should.equal('HaramiUp');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result > 0);
    done();
  });

  it('should detect an "EveningStar" pattern', function (done) {
    //       |      |
    //      OOO    ###
    //      OOO or ###
    //       |      |
    //                      } gap
    //  |               |
    // OOO             ###
    // OOO             ###
    // OOO             ###
    //  |               |
    indicator.resetScale();
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 10, close: 150, high: 150, low: 10}); // Up
    indicator.update({open: 160, close: 170, high: 175, low: 155}); // Star with gap
    indicator.update({open: 150, close: 100, high: 150, low: 100}); // then down
    indicator.name.should.equal('EveningStar');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result < 0);
    indicator.resetScale();
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 50, close: 150, high: 150, low: 50}); // Up
    indicator.update({open: 170, close: 160, high: 175, low: 155}); // Star with gap
    indicator.update({open: 150, close: 100, high: 150, low: 100}); // then down
    indicator.name.should.equal('EveningStar');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result < 0);
    done();
  });

  it('should detect a "MorningStar" pattern', function (done) {
    //  |               |
    // ###             OOO
    // ###             OOO
    // ###             OOO
    //  |               |
    //                      } gap
    //       |      |
    //      OOO    ###
    //      OOO or ###
    //       |      |
    indicator.resetScale();
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 200, close: 120, high: 200, low: 120}); // Down
    indicator.update({open: 110, close: 100, high: 115, low: 95});  // Star with gap
    indicator.update({open: 120, close: 160, high: 160, low: 120}); // then up
    indicator.name.should.equal('MorningStar');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result > 0);
    indicator.resetScale();
    indicator.resetScale();
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 10, close: 200, high: 200, low: 10});
    indicator.update({open: 160, close: 120, high: 160, low: 120}); // Down
    indicator.update({open: 100, close: 110, high: 115, low: 95});  // Star with gap
    indicator.update({open: 120, close: 160, high: 160, low: 120}); // then down
    indicator.name.should.equal('MorningStar');// FIXME: doit etre la continuété de la hausse en open ?
    assert(indicator.result > 0);
    done();
  });

  //------------------
  it('should use the "max" scale strategy', function (done) {
    var maxIndicator = new candlePattern({
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'max',     // 'max', 'average', 'median' or 'fixed'
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    });
    maxIndicator.update({open: 10, close: 200, high: 200, low: 10});
    assert.equal(maxIndicator.scale,190);
    maxIndicator.update({open: 20, close: 230, high: 230, low: 20});
    assert.equal(maxIndicator.scale,210);
    maxIndicator.update({open: 30, close: 250, high: 250, low: 20});
    assert.equal(maxIndicator.scale,230);
    done();
  });

  it('should use the "average" scale strategy', function (done) {
    var maxIndicator = new candlePattern({
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'average',     // 'max', 'average', 'median' or 'fixed'
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    });
    maxIndicator.update({open: 10, close: 200, high: 200, low: 10});
    assert.equal(maxIndicator.scale,190);
    maxIndicator.update({open: 20, close: 230, high: 230, low: 20});
    assert.equal(maxIndicator.scale,200);
    maxIndicator.update({open: 30, close: 250, high: 250, low: 20});
    assert.equal(maxIndicator.scale,210);
    done();
  });

  it('should use the "median" scale strategy', function (done) {
    var maxIndicator = new candlePattern({
      scaleMaxSize: 50,       // Scale based of the 'scaleMaxSize' previous candles
      strategy:'median',     // 'max', 'average', 'median' or 'fixed'
      dojiLimit:4/100,        // Doji is limited to 4% of the current scale
      shortLimit:15/100,      // Short body is limited to 15% of the current scale
      longLimit:20/100,       // Long body must be bigger of 20% of the current scale
      sameShadowLimit:4/100,  // Tolerance of 4% when compare equality of two shadows
      persistanceBeforHammerOrHangingMan:2, // Number of candle in the same direction before an Hammer or HangingMan
    });
    maxIndicator.update({open: 10, close: 200, high: 200, low: 10});
    assert.equal(maxIndicator.scale,190);
    maxIndicator.update({open: 20, close: 230, high: 230, low: 20});
    assert.equal(maxIndicator.scale,210);
    maxIndicator.update({open: 30, close: 250, high: 250, low: 20});
    assert.equal(maxIndicator.scale,210);
    done();
  });

  it('should use the "fixed" scale strategy', function (done) {
    var maxIndicator = new candlePattern({
      scaleMaxSize: 50,
      strategy:'fixed',
      dojiLimit:4,
      shortLimit:15,
      longLimit:20,
      sameShadowLimit:4,
      persistanceBeforHammerOrHangingMan:2,
    });
    assert.equal(true,  maxIndicator.isDoji(maxIndicator.buildWithPattern({open: 10, close: 14, high: 15, low: 9})));
    assert.equal(false, maxIndicator.isDoji(maxIndicator.buildWithPattern({open: 10, close: 15, high: 15, low: 9})));
    assert.equal(true,  maxIndicator.isShort(maxIndicator.buildWithPattern({open: 10, close: 25, high: 15, low: 9})));
    assert.equal(false, maxIndicator.isShort(maxIndicator.buildWithPattern({open: 10, close: 26, high: 15, low: 9})));
    assert.equal(true,  maxIndicator.isLong(maxIndicator.buildWithPattern({open: 10, close: 30, high: 20, low: 9})));
    assert.equal(false, maxIndicator.isLong(maxIndicator.buildWithPattern({open: 10, close: 29, high: 19, low: 9})));
    assert.equal(true,  maxIndicator.isShortUpper(maxIndicator.buildWithPattern({open: 10, close: 10, high: 25, low: 9})));
    assert.equal(false, maxIndicator.isShortUpper(maxIndicator.buildWithPattern({open: 10, close: 10, high: 26, low: 9})));
    assert.equal(true,  maxIndicator.isLongUpper(maxIndicator.buildWithPattern({open: 10, close: 10, high: 30, low: 9})));
    assert.equal(false, maxIndicator.isLongUpper(maxIndicator.buildWithPattern({open: 10, close: 10, high: 29, low: 9})));
    assert.equal(true,  maxIndicator.isLongLower(maxIndicator.buildWithPattern({open: 50, close: 50, high: 51, low: 30})));
    assert.equal(false, maxIndicator.isLongLower(maxIndicator.buildWithPattern({open: 50, close: 50, high: 51, low: 31})));
    done();
  });
});
