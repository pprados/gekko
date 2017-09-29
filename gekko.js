
console.log(`
    ______   ________  __    __  __    __   ______
   /      \\ /        |/  |  /  |/  |  /  | /      \\
  /$$$$$$  |$$$$$$$$/ $$ | /$$/ $$ | /$$/ /$$$$$$  |
  $$ | _$$/ $$ |__    $$ |/$$/  $$ |/$$/  $$ |  $$ |
  $$ |/    |$$    |   $$  $$<   $$  $$<   $$ |  $$ |
  $$ |$$$$ |$$$$$/    $$$$$  \\  $$$$$  \\  $$ |  $$ |
  $$ \\__$$ |$$ |_____ $$ |$$  \\ $$ |$$  \\ $$ \\__$$ |
  $$    $$/ $$       |$$ | $$  |$$ | $$  |$$    $$/ 
   $$$$$$/  $$$$$$$$/ $$/   $$/ $$/   $$/  $$$$$$/
`);

const util = require(__dirname + '/core/util');

console.log('\tGekko v' + util.getVersion());
console.log('\tI\'m gonna make you rich, Bud Fox.', '\n\n');

const dirs = util.dirs();

if(util.launchUI())
  return require(util.dirs().web + 'server');

const pipeline = require(dirs.core + 'pipeline');
const config = util.getConfig();
const mode = util.gekkoMode();

if(
  config.trader.enabled &&
  !config['I understand that Gekko only automates MY OWN trading strategies']
)
  util.die('Do you understand what Gekko will do with your money? Read this first:\n\nhttps://github.com/askmike/gekko/issues/201');

// > Ever wonder why fund managers can't beat the S&P 500?
// > 'Cause they're sheep, and sheep get slaughtered.
pipeline({
  config: config,
  mode: mode
});

