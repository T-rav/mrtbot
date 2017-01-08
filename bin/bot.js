'use strict';

var MrtBot = require('./lib/mrtbot');

var botToken = process.env.BOT_API_KEY;

var botInstance = new MrtBot({
    token: botToken,
    name: 'mr.t',
    dbPath: 'data/mrtbot.db',
    joinChannel: 'mrt_test_channel',
    cronSchedule: '0 30 10 * * 1-5',
    printToLog: true
});

botInstance.run();