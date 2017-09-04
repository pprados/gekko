console.log(`
***********************
****** LAB GEKKO ******
***********************
`);

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require(__dirname + '/core/util');
const moment = require('moment');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require(__dirname + '/core/workers/pipeline/parent'));
const log = require(__dirname + '/core/log');
var scan = require(__dirname + '/core/tools/dateRangeScanner');

const config = util.getConfig();
const csvpath=config.lab.file

const CSV_SEPARATOR=';';
const debug=false; // To desactivate the launch of tests

if (util.gekkoMode() != 'backtest')
  util.die('Lab only with backtest');


// Config variable to patch
const patchs=config.lab.patchs
// Extends simple loop, and invoke initialization
for (var i=0;i<patchs.length;++i) {
  var patch=patchs[i];
  if ('loop' in patch) {
    patch.exloop=[
      "config.{} = "+patch.loop[0],
      "config.{} "+patch.loop[1],
      "config.{} = config.{} "+patch.loop[2]];
  }
  if (patch.exloop.length > 3) {
    //log.debug(patch.exloop[3].replace(/{}/g,patch.path));
    eval(patch.exloop[3].replace(/{}/g,patch.path));
  }
}
// Set the default fields
if (!('fields' in config.lab)) {
  config.lab.fields=[
    "method",
    "exchange","currency","asset",
    "candleSize","historySize",
    "patchs",
    "startTime","endTime","timespan",
    "startPrice","endPrice","market",
    "trades",
    "startBalance","balance","profit","relativeProfit",
    "relativeResult"
  ];
}

/**
 * Slide a dateRange with specific delta
 * @param dateRange The dateRange to slide.
 * @param number The number to add
 * @param unit The unit to add.
 */
function slidingWindow(dateRange,number,unit) {
  dateRange.from=moment(dateRange.from).add(number,unit).format('YYYY-MM-DD HH:mm:ss');
  dateRange.to=moment(dateRange.to).add(number,unit).format('YYYY-MM-DD HH:mm:ss');
}


function startPipeline(config,onError,onExit) {
  const id = (Math.random() + '').slice(3);
  pipelineRunner('backtest', config, (err, event) => {
    if (err) {
      onError(err,event);
    }

    if (!event) {
      return; // Crash may be
    // } else if(event.type === 'trade') {
    //   log.debug("Receive trade");
    //   return;
    // } else if (event.type === 'roundtrip') {
    //   log.debug("Receive roundtrip");
    //   return;
    // } else if (event.type === 'update') {
    //   log.debug("Receive update");
    }  else {
      if (event.report) {
        onExit(event.report);
      }
      else {
        console.log("unknown event");
        console.dir(event);
      }
    }
  });
}

function saveReportHeaders() {
  if (!fs.existsSync(csvpath)) {
    var headers="";
    var fields=config.lab.fields;
    for (var i=0;i<fields.length;++i) {
      if (fields[i] === 'patchs') {
        for (var j=0;j<config.lab.values.length;++j) {
          headers=headers.concat(config.lab.values[j].path).concat(CSV_SEPARATOR)
        }
      }
      else {
        headers=headers.concat(fields[i]).concat(CSV_SEPARATOR)
      }
    }
    headers=headers.concat('\n');

    fs.writeFileSync(csvpath,headers);
  }
}

function calulateResult(report) {
  var marketDiff=report.endPrice-report.startPrice;
  var balance=report.balance-report.startBalance;
//  return result=(balance-marketDiff)/report.endPrice;
  return result=(balance-marketDiff);
}

function saveReport(report) {
  var CSV="";
  var fields=config.lab.fields;
  for (var i=0;i<fields.length;++i) {
    var field=fields[i];
    if (field === 'method') {
      CSV=CSV.concat(JSON.stringify(config.tradingAdvisor.method)).concat(CSV_SEPARATOR)
    } else if (field == 'exchange') {
      CSV=CSV.concat(config.watch.exchange).concat(CSV_SEPARATOR);
    } else if (field == 'currency') {
      CSV=CSV.concat(config.watch.currency).concat(CSV_SEPARATOR);
    } else if (field == 'asset') {
      CSV=CSV.concat(config.watch.asset).concat(CSV_SEPARATOR);
    } else if (field == 'candleSize') {
      CSV=CSV.concat(config.tradingAdvisor.candleSize).concat(CSV_SEPARATOR);
    } else if (field == 'historySize') {
      CSV=CSV.concat(config.tradingAdvisor.historySize).concat(CSV_SEPARATOR);
    } else if (field === 'patchs') {
      for (var j=0;j<config.lab.values.length;++j) {
        CSV=CSV.concat(JSON.stringify(config.lab.values[j].value)).concat(CSV_SEPARATOR)
      }
    }
    else if ((field === 'market') || (field === 'relativeProfit')) {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR)
      else CSV=CSV.concat((report[field]/100).toFixed(4)).concat(CSV_SEPARATOR) // %
    }
    else if (field === 'relativeResult') {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR)
      else CSV=CSV.concat(calulateResult(report).toFixed(4)).concat(CSV_SEPARATOR)
    } else {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR)
      else CSV=CSV.concat(JSON.stringify(report[field])).concat(CSV_SEPARATOR)
    }
  }
  CSV=CSV.concat('\n');
  saveReportHeaders();
  fs.appendFileSync(csvpath, CSV);
}

function loopVariablesAsync(index, func, callback) {
  var done = false;
  if (index<patchs.length) {
    var patch = patchs[index];
    //log.debug(patch.loop[0].replace(/{}/g,patch.path)); // Set
    try {
      eval(patch.exloop[0].replace(/{}/g,patch.path)); // Set
    } catch (e) {
      log.error("Error when eval "+patch.exloop[0]);
      return;
    }
    log.debug("")
  }
  var loop = {
    next: function() {
      if (done) {
        return;
      }
      var variable = patchs[index];
      // Test
      try {
        var rc=eval(variable.exloop[1].replace(/{}/g,variable.path)); // Check
      } catch (e) {
        log.error("Error when eval "+patch.exloop[0]);
        return;
      }
      //log.debug(eval(patch.loop[1].replace(/{}/g,patch.path))+" == " +rc);
      if (rc) {
        func({
          next: function() {
            //log.debug(patch.loop[2].replace(/{}/g,patch.path));
            try {
              eval(variable.exloop[2].replace(/{}/g,variable.path)); // Increment
            } catch(e) {
              log.error("Error when eval "+patch.exloop[0]);
              return;
            }
            loop.next();
          }
        },index);
      } else {
        done = true;
        callback();
      }
    },

    break: function() {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

// Create an invoke a recursive async loop
function loopAllPatchsAsync(body,done) {

  var nextsCallBack=[];

  for (var i=0;i<patchs.length-1;++i) {
    nextsCallBack.push(function(loop,index) {
      loopVariablesAsync(
        index+1,
        nextsCallBack[index+1],
        function() {
          // End inner loop
          loop.next()
        }
      )
    });
  }
  nextsCallBack.push(function(loop,index)  { body(loop); });

  if (patchs.length>0 && config.lab.enabled) {
    loopVariablesAsync(0,
      nextsCallBack[0],
      function() {
        // End outer loop
        done()
      })
  }
  else {
    const pipeline = require(util.dirs().core + 'pipeline');
    pipeline({
      config: config,
      mode: 'backtest'
    });
  }
}

var numberOfTest=0;

function newSimulation(cb) {
  log.info();
  log.info("*********************** New Back Test ("+ ++numberOfTest +") ***********************");
  savePatchedConfig();
  printPatchedConfig();
  startPipeline(config,
    function(err,event) {
      saveReport(null);
      log.info("Impossible to execute this scenario");
      cb();
    },
    function(report) {
      saveReport(report);
      var result=calulateResult(report);
      log.info();
      log.info("Difference with marker ="+result.toFixed(0)+" ("+((result>0) ? "Good deal !" :"")+")");
      cb();
    });
}

function savePatchedConfig() {
  config.lab.values=[]
  for (var i=0;i<patchs.length;++i) {
    config.lab.values.push({
      path:patchs[i].path,
      value:eval("config."+patchs[i].path)
    })
  }

}

function printPatchedConfig() {
  for (var i=0;i<config.lab.values.length;++i) {
    log.info(config.lab.values[i].path+" = "+JSON.stringify(config.lab.values[i].value))
  }
  log.info();
}

// -------------- Start the experience
// Reset file
function resetFile() {
  if (fs.existsSync(csvpath)) fs.unlinkSync(csvpath);
  var dir=path.dirname(csvpath);
  fs.existsSync(dir) || fs.mkdirSync(dir);
}

// And start the recursive loop
function start() {
  resetFile();
  var startTime=Date.now();
  loopAllPatchsAsync(function(loop) {
      if (debug) {
        savePatchedConfig();
        printPatchedConfig();
        console.log("Simule... ");
        loop.next();
        return;
      }
      newSimulation(function(result) {
        loop.next(); // For cycle could continue
      })},
    function(){
      log.info('All simulations are done. The results are in '+config.lab.file+
        "("+(moment.duration(Date.now()-startTime).humanize())+")");
    }
  );

}

if (config.backtest.daterange === 'scan') {
  scan((err, ranges) => {
    if(_.size(ranges) === 0)
      util.die('No history found for this market', true);

    if(_.size(ranges) === 1) {
      var r = _.first(ranges);
      log.info('Gekko was able to find a single daterange in the locally stored history:');
      log.info('\t', 'from:', moment.unix(r.from).utc().format('YYYY-MM-DD HH:mm:ss'));
      log.info('\t', 'to:', moment.unix(r.to).utc().format('YYYY-MM-DD HH:mm:ss'));

      setDateRange(r.from, r.to);
      start();
      return;
    }

    log.error(
      'Gekko detected multiple dateranges in the locally stored history.',
      'Please set \'config.backtest.from\' and \'config.backtest.to\',',
      'with the daterange you are interested in testing.'
    );
    return
  });
}
else
  start();


