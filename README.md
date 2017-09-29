# Gekko [![npm](https://img.shields.io/npm/dm/gekko.svg)]() [![Build Status](https://travis-ci.org/askmike/gekko.png)](https://travis-ci.org/askmike/gekko) [![Build status](https://ci.appveyor.com/api/projects/status/github/askmike/gekko?branch=stable&svg=true)](https://ci.appveyor.com/project/askmike/gekko)

![Gordon Gekko](http://mikevanrossum.nl/static/gekko.jpg)

### Discord community for crypto bots
<a href="https://discord.gg/qZHhdju"><img src="https://discordapp.com/assets/fc0b01fe10a0b8c602fb0106d8189d9b.png" height="70" ></a>
<br>


*The most valuable commodity I know of is information.*

-Gordon Gekko

Gekko is a Bitcoin TA trading and backtesting platform that connects to popular Bitcoin exchanges. It is written in javascript and runs on [nodejs](http://nodejs.org).

*Use Gekko at your own risk.*

## Documentation

See [the documentation website](https://gekko.wizb.it/docs/introduction/about_gekko.html).

## Installation & Usage

See [the installing Gekko doc](https://gekko.wizb.it/docs/installation/installing_gekko.html).

## Final

If Gekko helped you in any way, you can always leave me a tip at (BTC) 13r1jyivitShUiv9FJvjLH7Nh1ZZptumwW


## My patch

- Install nodejs and npm
- clone this repo
```shell
$ git clone git@github.com:pprados/gekko.git

```

- Install dependecies
```shell
$ npm install
$ npm install emailjs
``` 

- Start UI
```shell
$ node gekko --config sample-config.js --ui
```

- Import this datas : Poloniex, USDT/BTC, from 2017-01-01 to 2017-03-01.

Then, it's possible to start a backtest
```shell
$ node gekko --config sample-config.js --backtest
```

To update the parameter between each test, and generate a CSV file
```
$ node labgekko --config sample-config.js --backtest
```

To search the better value of parameter and generate a file
```
$ node labgekko --config sample-config.js --backtest --auto-optimize
```
