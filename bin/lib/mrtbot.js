'use strict';

var util = require('util');
var SQLite = require('sqlite3').verbose();
var Slackbot = require('slackbots');
var fs = require('fs');

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
                console.log("Post to " + self.settings.joinChannel); 
                bot.postMessageToChannel(self.settings.joinChannel, 'I am here to Jibba Jabba while I pitty you.' +
                '\n I tell jokes, but only very funny ones. Just say `Mr. T` or `' + self.settings.name + '` to hear me Jibba Jabba!', self.params);
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
            return message.text.toLowerCase().indexOf('Mr. T') > -1 || message.text.toLowerCase().indexOf(self.settings.name) > -1;
        }

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




//util.inherits(MrtBot, bot);

/*
MrtBot.prototype.run = function(){
    var self = this;
    MrtBot.super_.call(self, self.settings);
    self.on('start', self._onStart);
    self.on('message', self._onMessage);
};

MrtBot.prototype._onStart = function(){
    var self = this;
    self._loadBotUser();
    self._connectDb();
    self._checkIfFirstRun();
};

MrtBot.prototype._onMessage = function(message){
    var self = this;
    if(self._isChangeMessage(message) 
        && self._isChannelConveration(message)
        && self._isFromMrtBot(message)
        && self._isSpeakingToMrT(message)){
            self._replyWithJoke(message);
    }
};

MrtBot.prototype._replyWithJoke = function(message){
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function(err, record){
        if(err){
            return console.error(err);
        }

        var channel = self._getChannelById(message.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user:true});
        self.db.run('UPDATE jokes SET used = used +1 WHERE id = ?', record.id);
    });
};

MrtBot.prototype._loadBotUser = function(){
    var self = this;
    self.user = self.user.filter(function(user){
        return user.name === self.name;
    });
};

MrtBot.prototype._connectDb = function(){
    var self = this;
    if(!fs.existSync(self.dbPath)){
        console.error('Database path ' + self.dbPath + ' does not exist!');
        process.exit(1);
    }
    self.db = new SQLite.Database(self.dbPath);
};

MrtBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

MrtBot.prototype._welcomeMessage = function () {
    var self = this;
    self.postMessageToChannel(self.settings.joinChannel, 'I am here to jibber jabba. I pitty you.' +
        '\n I can tell jokes, but very honest ones. Just say `Mr. T` or `' + self.name + '` to invoke me!',
        {as_user: true});
};

MrtBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

MrtBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' && message.channel[0] === 'C';
};

MrtBot.prototype._isSpeakingToMrT = function (message) {
    return message.text.toLowerCase().indexOf('mr. t') > -1 
            || message.text.toLowerCase().indexOf(this.name) > -1;
};

MrtBot.prototype._isFromMrtBot = function (message) {
    return message.user === this.user.id;
};

MrtBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};
*/
