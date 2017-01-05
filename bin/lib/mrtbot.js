'use strict';

var util = require('util');
var SQLite = require('sqlite3').verbose();
var Slackbot = require('slackbots');
var fs = require('fs');
var schedule = require('node-schedule');

var MrtBot = function(settings){
    var self = this;
    self.settings = settings;
    self.db = null;
    self.params = {
                    icon_emoji: ':mrt:' /* Hack to get proper image in chat, not sure how to the get user junk as per the broken example */
                };
    self.slackBot = new Slackbot(settings);    
};

MrtBot.prototype.run = function(){
    var bot = this.slackBot;
    var self = this;

    // schedule a joke to be sent in the morning
    schedule.scheduleJob(self.settings.cronSchedule, function(){
        self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function(err, record){
            if(err){
                return console.error(err);
            }

            bot.postMessageToChannel(self.settings.joinChannel, record.joke, self.params);
            self.db.run('UPDATE jokes SET used = used +1 WHERE id = ?', record.id);
        });
    }); 
    
    bot.on('start', function(){

        // save user so we know to filter our own messages
        self.user = bot.users.filter(function (user) {
            return user.name === self.settings.name;
        })[0];

        if(!fs.existsSync(self.settings.dbPath)){
            console.error('Database path ' + self.settings.dbPath + ' does not exist!');
            process.exit(1);
        }
        self.db = new SQLite.Database(self.settings.dbPath);
        // ------------
        
        /* First run check */
        self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
            if (err) {
                console.error('DATABASE ERROR:', err);
            }

            var currentTime = (new Date()).toJSON();

            // this is a first run, post welcome message
            if (!record) { 
                bot.postMessageToChannel(self.settings.joinChannel, 'I am here to Jibba Jabba while I pitty you.' +
                '\n I tell jokes, but only very funny ones. Just type `Mr. T` or `' + self.settings.name + '`!', self.params);
                return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
            }

            // updates with new last running time
            self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
        });
    });

    bot.on('message',function(message){

        function isChatMessage(message){
            return message.type === 'message' && Boolean(message.text)
        }
        function isChannelConversation(message){
            return typeof message.channel === 'string' && message.channel[0] === 'C';
        }
        function isFromBot(message){
            if(!message) return false;
            
            return message.username === self.user.name;
        }
        function mentionsBot(message){
            return message.text.toLowerCase().indexOf('mr. t') > -1 || message.text.toLowerCase().indexOf(self.settings.name) > -1;
        }

        // see if we need to respond to the message
        if(isChatMessage(message) && isChannelConversation(message) && !isFromBot(message) && mentionsBot(message)){
            self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function(err, record){
                if(err){
                    return console.error(err);
                }

                function getChannel(channelId){
                    return bot.channels.filter(function (item) {
                        return item.id === channelId;
                    })[0];
                }
                var channel = getChannel(message.channel);
                bot.postMessageToChannel(channel.name, record.joke, self.params);
                self.db.run('UPDATE jokes SET used = used +1 WHERE id = ?', record.id);
            });
        }
    });
}

module.exports = MrtBot;

