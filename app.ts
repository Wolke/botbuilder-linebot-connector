var express = require('express');
import * as builder from "botbuilder";
import * as  istorage from "./lib/IStorageClient";
import * as  azure from './lib/AzureBotStorage.js';
import * as  conf from './config/conf.js'
import { LineConnector } from "./line/LineConnector"

var server = express();
server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});

var docDbClient = new istorage.IStorageClient();
var tableStorage = new azure.AzureBotStorage({
    gzipData: false
}, docDbClient);


// var connector = new builder.ConsoleConnector().listen();
var connector = new LineConnector({
    // Miss Tarot 塔羅小姐
    channelId: process.env.channelId || "1487202031",
    channelSecret: process.env.channelSecret || "64078989ba8249519163b052eca6bc58",
    channelAccessToken: process.env.channelAccessToken || "QELaTKb+JpKNt+LndfixVD8EA+DGID5wgvZ10skM3F2nPPzvTC7ZpvxQ3onkR+hu06eRv1S+NG6Cfyw3EtfW21K6x6RGBRqf8ehPYUalja77myU10cSBR9GmYA/HDri9jDg5YqDHUVg5JCrkb+nnygdB04t89/1O/w1cDnyilFU="

});

server.post('/line', connector.listen());

var bot = new builder.UniversalBot(connector).set('storage', tableStorage); //set your storage here

bot.dialog('/', [
    function (session, args, next) {

        console.log("/")
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {

        console.log("/profile")
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        console.log("results.response==>", results.response);
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.on('conversationUpdate', function (message) {
    console.log("conversationUpdate")

    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : "Hello...";
        var reply = new builder.Message()
            .address(message.address)
            .text(txt);
        bot.send(reply);
    } else if (message.membersRemoved) {
        // See if bot was removed
        var botId = message.address.bot.id;
        for (var i = 0; i < message.membersRemoved.length; i++) {
            if (message.membersRemoved[i].id === botId) {
                // Say goodbye
                var reply = new builder.Message()
                    .address(message.address)
                    .text("Goodbye");
                bot.send(reply);
                break;
            }
        }
    }
});