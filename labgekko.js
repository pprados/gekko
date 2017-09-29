// Usage : node labgekko --config config.js --backtest [--auto-config]
// --auto-config write the best combinaison of parameters in labs directory.
//
// In config.js, you can use a hack to import this new parameters
//
// var importJS="./labs/available-"+config.watch.currency+config.watch.asset+".js";
// if (fs.existsSync(importJS)) {
//    require(importJS).patch(config);
// }

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require(__dirname + '/core/util');
const moment = require('moment');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require(__dirname + '/core/workers/pipeline/parent'));
const log = require(__dirname + '/core/log');
const scan = require(__dirname + '/core/tools/dateRangeScanner');
const Mailer = require( __dirname + '/plugins/mailer');
var program = require('commander');

const config = util.getConfig();
if (config.lab === undefined ) process.exit(0);
if (config.lab.enabled === false) process.exit(0);
const csvpath=config.lab.file;

const CSV_SEPARATOR=';';
const debug=false; // To desactivate the launch of tests

if (util.gekkoMode() !== 'backtest')
  util.die('Lab only with backtest');

// Config variable to patch
const patchs=config.lab.patchs;
const loopContext={};


log.info(`
***********************
****** LAB GEKKO ******
***********************
`);



// Extends simple loop, and invoke initialization
for (var i=0;i<patchs.length;++i) {
  const patch=patchs[i];
  if ('loop' in patch) {
    patch.exloop=[
      "config.{} = "+patch.loop[0],
      "config.{} "+patch.loop[1],
      "config.{} = config.{} "+patch.loop[2]];
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

loopContext.init=function() {
  for (var i=0;i<patchs.length;++i) {
    var patch=patchs[i];
    if (patch.exloop.length > 3) {
      //log.debug(patch.exloop[3].replace(/{}/"g,patch.path));
      try {
        eval(patch.exloop[3].replace(/{}/g,patch.path));
      } catch (e) {
        //log.error("Error when eval '"+patch.exloop[3]+"'",e);
        console.error("Error when eval '"+patch.exloop[3]+"'",e);
        return;
      }
    }
  }
};

loopContext.init();

/**
 * Slide a dateRange with specific delta
 * @param dateRange The dateRange to slide.
 * @param number The number to add
 * @param unit The unit to add.
 */
function slidingWindow(dateRange,number,unit) {
  dateRange.from=moment(dateRange.from).add(number,unit).format('YYYY-MM-DD HH:mm:ss');
  dateRange.to=moment(dateRange.to).add(number,unit).format('YYYY-MM-DD HH:mm:ss');
  // Jusqu'a maintenant au maximum
  if (moment(dateRange.to).isAfter(moment(Date.now())))
    dateRange.to=moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}


function startPipeline(config,onError,onExit) {
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
        log.warn("unknown event");
      }
    }
  });
}

function saveReportHeaders() {
  if (!fs.existsSync(csvpath)) {
    var headers="";
    const fields=config.lab.fields;
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
  const marketDiff=report.endPrice-report.startPrice;
  const balance=report.balance-report.startBalance;
  return (balance-marketDiff);
}

function calulateRelativeResult(report) {
  const BuyAndHoll=report.endPrice-report.startPrice;
  const Bot=report.balance-report.startBalance;
  const BuyAndHollPercent=BuyAndHoll / report.startPrice;
  const BotPercent=Bot / report.startBalance
  return (BotPercent-BuyAndHollPercent);
}

function saveReport(report) {
  saveReportInResults(report);
  var CSV="";
  const fields=config.lab.fields;
  for (var i=0;i<fields.length;++i) {
    const field=fields[i];
    if (field === 'method') {
      CSV=CSV.concat(JSON.stringify(config.tradingAdvisor.method)).concat(CSV_SEPARATOR)
    } else if (field === 'exchange') {
      CSV=CSV.concat(config.watch.exchange).concat(CSV_SEPARATOR);
    } else if (field === 'currency') {
      CSV=CSV.concat(config.watch.currency).concat(CSV_SEPARATOR);
    } else if (field === 'asset') {
      CSV=CSV.concat(config.watch.asset).concat(CSV_SEPARATOR);
    } else if (field === 'candleSize') {
      CSV=CSV.concat(config.tradingAdvisor.candleSize).concat(CSV_SEPARATOR);
    } else if (field === 'historySize') {
      CSV=CSV.concat(config.tradingAdvisor.historySize).concat(CSV_SEPARATOR);
    } else if (field === 'patchs') {
      for (var j=0;j<config.lab.values.length;++j) {
        CSV=CSV.concat(JSON.stringify(config.lab.values[j].value)).concat(CSV_SEPARATOR)
      }
    }
    else if ((field === 'market') || (field === 'relativeProfit')) {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR);
      else CSV=CSV.concat((report[field]/100).toFixed(4)).concat(CSV_SEPARATOR) // %
    }
    else if (field === 'relativeResult') {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR);
      else CSV=CSV.concat(calulateResult(report).toFixed(4)).concat(CSV_SEPARATOR)
    } else if (field === 'percentResult') {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR);
      else CSV=CSV.concat(calulateRelativeResult(report).toFixed(4)).concat(CSV_SEPARATOR)
    } else {
      if (!report) CSV=CSV.concat("ERROR").concat(CSV_SEPARATOR);
      else CSV=CSV.concat(JSON.stringify(report[field])).concat(CSV_SEPARATOR)
    }
  }
  CSV=CSV.concat('\n');
  saveReportHeaders();
  fs.appendFileSync(csvpath, CSV);
}

loopContext.loopVariablesAsync=function(index, func, callback) {
  var done = false;
  if (index<patchs.length) {
    const patch = patchs[index];
    //log.debug(patch.loop[0].replace(/{}/g,patch.path)); // Set
    try {
      (function(cmd){
        return eval(cmd);
      }).call(loopContext,patch.exloop[0].replace(/{}/g,patch.path)); // Set
    } catch (e) {
      log.error("Error when eval '"+patch.exloop[0].replace(/{}/g,patch.path)+"'",e);
      return;
    }
    log.debug("")
  }
  const loop = {
    next: function() {
      if (done) {
        return;
      }
      const variable = patchs[index];
      var result;
      // Test
      try {
        result=function(cmd){
          return eval(cmd);
        }.call(loopContext,variable.exloop[1].replace(/{}/g,variable.path)); // Check
      } catch (e) {
        log.error("Error when eval '"+variable.exloop[1].replace(/{}/g,variable.path)+"'",e);
        return;
      }
      //log.debug(eval(patch.loop[1].replace(/{}/g,patch.path))+" == " +rc);
      if (result) {
        func({
          next: function() {
            //log.debug(patch.loop[2].replace(/{}/g,patch.path));
            try {
              (function(cmd){
                return eval(cmd);
              }).call(loopContext,variable.exloop[2].replace(/{}/g,variable.path));
            } catch(e) {
              log.error("Error when eval '"+variable.exloop[2].replace(/{}/g,variable.path)+"'",e);
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
};

// Create an invoke a recursive async loop
loopContext.loopAllPatchsAsync=function(body,done) {

  const nextsCallBack=[];

  for (var i=0;i<patchs.length-1;++i) {
    nextsCallBack.push(function(loop,index) {
      loopContext.loopVariablesAsync(
        index+1,
        nextsCallBack[index+1],
        function() {
          // End inner loop
          loop.next()
        }
      )
    });
  }
  nextsCallBack.push(function(loop)  { body(loop); });

  if (patchs.length>0 && config.lab.enabled) {
    this.loopVariablesAsync(0,
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
};

var numberOfTest=0;

function newSimulation(cb) {
  if (!config.silent) {
    log.info();
    log.info("*********************** New Back Test ("+ ++numberOfTest +") ***********************");
  }
  savePatchedConfig();
  printPatchedConfig();
  startPipeline(config,
    function(err,event) {
      log.error("Impossible to execute this scenario",err);
      saveReport(null);
      cb();
    },
    function(report) {
      saveReport(report);
      const result=calulateResult(report);
      if (!config.silent) {
        log.info();
        log.info("Difference with market ="+result.toFixed(0)+((result>0) ? " (Good deal !)" :""));
      }
      cb();
    });
}

function savePatchedConfig() {
  config.lab.values=[];
  for (var i=0;i<patchs.length;++i) {
    config.lab.values.push({
      path:patchs[i].path,
      value:eval("config."+patchs[i].path)
    })
  }

}

function printPatchedConfig() {
  if (config.silent) return;
  for (var i=0;i<config.lab.values.length;++i) {
    log.info(config.lab.values[i].path+" = "+JSON.stringify(config.lab.values[i].value))
  }
  log.info();
}

// -------------- Start the experience
// Reset file
function resetFile() {
  if (fs.existsSync(csvpath)) fs.unlinkSync(csvpath);
  const dir=path.dirname(csvpath);
  fs.existsSync(dir) || fs.mkdirSync(dir);
}

// And start the recursive loop
function start() {
  resetFile();
  config.mailer.enabled=false;
  config.adviceLogger.enabled=false;
  config.trader.enabled=false;
  const startTime=Date.now();
  loopContext.loopAllPatchsAsync(function(loop) {
      if (debug) {
        savePatchedConfig();
        printPatchedConfig();
        loop.next();
        return;
      }
      newSimulation(function(result) {
        loop.next(); // For cycle could continue
      })},
    function(){
      if (!config.silent)
        log.info('All simulations are done. The results are in '+config.lab.file+
          "("+(moment.duration(Date.now()-startTime).humanize())+")");
      endReportInResults();
    }
  );

}
//-----------------------------
//----------------------
const BACK_TEST = /(\d+) *(.+)/.exec(config.lab.backTest); // 1 mois en arrière
const DURING_TEST = /(\d+) *(.+)/.exec(config.lab.duringTest); // Pendant 2 mois
const SLIDING_WINDOWS = /(\d+) *(.+)/.exec(config.lab.slidingWindows); // Glissement de 1 mois
const MAX_DATE = (config.lab.maxDate) ? moment(config.lab.maxDate) : undefined; // Date max

results={};
var plugin=(program.autoOptimize !== undefined);

function startReportInResults() {
  "use strict";
  if (!plugin) return;

// Sliding windows depuis les x derniers mois
  for (var j=0;j<config.lab.patchs.length;++j) {
    if (config.lab.patchs[j].path === "backtest.daterange") {
      if (MAX_DATE !== undefined) {
        var max=MAX_DATE;
        var from=moment(MAX_DATE).subtract(Number(BACK_TEST[1]),BACK_TEST[2]).startOf('day');
      }
      else {
        var max=moment().startOf('day').add(1,'second');
        var from=moment().subtract(Number(BACK_TEST[1]),BACK_TEST[2]).startOf('day');
      }
      var to=moment(from).add(Number(DURING_TEST[1]),DURING_TEST[2]);
      if (to.isAfter(max))
        to=max;
      config.lab.patchs[j].exloop= [
        'config.{}={from:"'+from.format('YYYY-MM-DD HH:mm:ss')+'", to: "'+to.format('YYYY-MM-DD HH:mm:ss')+'"}',
        'moment(config.{}.to).isBefore("'+max.format('YYYY-MM-DD HH:mm:ss')+'")',
        'slidingWindow(config.{},'+Number(SLIDING_WINDOWS[1])+', "'+SLIDING_WINDOWS[2]+'")',
        '// require nothing in global scope',
      ]
    }
  }
}

function saveReportInResults(report)  {
  "use strict";
  if (!plugin) return;
  if (report === null) return;
  var key=""; // Cle de la combinaison
  for (var j=0;j<config.lab.values.length;++j) {
    if (config.lab.values[j].path !== "backtest.daterange") {
      key=key+(config.lab.values[j].value)+"|"
    }
  }
  var values=results[key]
  if (values == undefined) values=[];
  values.push(calulateRelativeResult(report));
  results[key]=values;
}

function endReportInResults() {
  "use strict";
  if (!plugin) return;
  var betterKey;
  var betterAverage=Number.NEGATIVE_INFINITY;
  for (var property in results) {
    var m=results[property];
    var average=0;
    for (var i=0;i<m.length;++i) {
      average += m[i];
    }
    average = average / m.length;
    if (average > betterAverage) {
      betterAverage = average;
      betterKey = property;
    }
  }

  // Affiche le résultat final
  if (betterKey === undefined) {
    log.error("Pas d'info");
    process.exit(1);
  }
  var result="";
  var vals=betterKey.split("|");
  for (var j=0;j<config.lab.values.length;++j) {
    if (config.lab.values[j].path !== "backtest.daterange") {
      result += "config."+config.lab.values[j].path + "=" + vals[j] + ";\n";
    }
  }

  var js=""
  js += "// "+ config.watch.exchange+ " / " + config.watch.currency+" / "+config.watch.asset + "\n";
  js += "// average = "+(betterAverage*100).toFixed(2)+"%\n";
  js += "// { backTest:"+config.lab.backTest+", duringTest:"+config.lab.duringTest+", slidingWindows:"+config.lab.slidingWindows+"\n";
  js += "// Generate at "+moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')+"\n";
  js += "module.exports = { patch : function(config) {\n";
  js += result;
  js += "}}\n"
  fs.writeFileSync("labs/available-"+config.watch.currency+config.watch.asset+".js",js,"utf8");
//  if (!config.silent) {
    log.info("\n"+js);
  //}
  // Send email
  var mailer=new Mailer(function() { });
  mailer.mail(
    "Gekko refresh parameters",
    js,
    _.bind(function(err) {
      mailer.checkResults(err);
      mailer.done();
    }, this)
  );

}

startReportInResults();
//-----------------------------

// helper to store the evenutally detected
// daterange.
const setDateRange = function(from, to) {
  config.backtest.daterange = {
    from: moment.unix(from).utc().format(),
    to: moment.unix(to).utc().format(),
  };
  util.setConfig(config);
};

if (config.backtest.daterange === 'scan') {
  scan((err, ranges) => {
    if(_.size(ranges) === 0)
      util.die('No history found for this market', true);

    if(_.size(ranges) === 1) {
      const r = _.first(ranges);
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
  });
}
else
  start();


