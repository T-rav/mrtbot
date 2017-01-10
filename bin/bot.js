'use strict';

var MrtBot = require('./lib/mrtbot');

var botToken = process.env.BOT_API_KEY;

var botInstance = new MrtBot({
    token: botToken,
    name: 'mr.t',
    dbPath: 'data/mrtbot.db',
    joinChannel: 'mrt_test_channel',
    cronSchedule: '0 * 0,4,8,12,16,20 * * *',
    printToLog: false
});

botInstance.run();