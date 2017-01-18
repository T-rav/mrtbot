'use strict';

var MrtBot = require('./lib/mrtbot');

var botInstance = new MrtBot({
    token: '_bot_token_here',
    name: 'mr.t',
    dbPath: 'data/mrtbot.db',
    joinChannel: '_chat_channel_here_',
    cronSchedule: '0 * 0,4,8,12,16,20 * * *',
    printToLog: false
});

botInstance.run();