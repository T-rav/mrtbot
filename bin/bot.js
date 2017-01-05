'use strict';

var Bot = require('lib/MrTBot');

var botToken = process.env.BOT_APY_KEY;

var botInstance = new MrtBot({
    token: botToken,
    name: 'Mr. T Bot',
    dbPath: 'data/mrtbot.db',
    joinChannel: 'mrt_test',
});

botInstance.run();