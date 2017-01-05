'use strict';

/**
 * Command line script that generates a SQLite database file filled with jokes and quotes from Mr. T
 *
 * Usage:
 *
 *   node databaseInit.js
 *
 *   outputs to "mrtbot.db"
 *
 * @author Travis Frisinger <tmfrisinger@gmail.com>
 */

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

var outputFile = 'data/mrtbot.db';
var inputToProcess = '';
var inputStream = fs.createReadStream('data/jokes.txt');

inputStream.on('readable',function(){
    var chunk;
    while((chunk=inputStream.read())!=null){
        inputToProcess += chunk;
    }
});

inputStream.on('end',function(){
    
    var dbHandle = ensureDbExist();
    var writtenJokes = writeJokestoDb(dbHandle);
    console.log("Wrote [ " + writtenJokes + " ] jokes to the file [ " + outputFile + " ]");

    function ensureDbExist(){
        var db = new sqlite3.Database(outputFile);
        if(!fs.existsSync(outputFile)){
            db.serialize();
            db.run('CREATE TABLE IF NOT EXISTS jokes (id INTEGER PRIMARY KEY, joke TEXT, used INTEGER DEFAULT 0)');
            db.run('CREATE INDEX jokes_used_idx on jokes(used)');
        }
        return db;
    }

    function writeJokestoDb(dbHandle){
        var index = inputToProcess.indexOf('\n');
        var lastIndex = 0;
        var jokesWritten = 0;
        while(index > -1){
            var line = inputToProcess.substring(lastIndex,index);
            lastIndex = index + 1;
            dbHandle.run('INSERT INTO jokes(joke) VALUES (?)', line, function(err){
                if(err){
                    console.log(err);
                }
                jokesWritten++;
            });
            index = inputToProcess.indexOf('\n', lastIndex);
        }

        return jokesWritten;
    }

});