var express = require('express');

var config = require("config")
import * as builder from "botbuilder";
// import * as  istorage from "./lib/IStorageClient";
// import * as  azure from './lib/AzureBotStorage.js';

import { LineConnector, Sticker, Location } from "./line/LineConnector"
import { CardAction } from "botbuilder";

import * as q_list from "./questions.js"
import { connect } from "tls";
// console.log(q_list)
var server = express();
server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});

// var docDbClient = new istorage.IStorageClient();
// var tableStorage = new azure.AzureBotStorage({
//     gzipData: false
// }, docDbClient);

var connector = new LineConnector({
    hasPushApi: false, //you need to pay push api >.,<
    channelId: config.channelId,
    channelSecret: config.channelSecret,
    channelAccessToken: config.channelAccessToken
});
server.post('/line', connector.listen());

// var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector)
// .set('storage', tableStorage); //set your storage here

bot.dialog("/", s => {
    s.beginDialog("start")
})

bot.on('conversationUpdate', function (message) {
    switch (message.text) {
        case 'follow':
            break;
        case 'unfollow':
            break;
        case 'join':
            bot.beginDialog(message.address, "start")
            break;
        case 'leave':
            break;
    }
    console.log("conversationUpdate")

});

bot.dialog("start", s => {
    s.send(new builder.Message(s).addAttachment(new Sticker(s, 1, 2)));
    s.send("遊戲開始")
    s.beginDialog("ask");
})
bot.dialog("ask", [
    (s, args) => {
        let q: {
            "q": string,
            "options": Array<string>,
            "a": string
        };
        if (args && args.q) {
            q = args.q

        } else {
            q = q_list[Math.floor(Math.random() * (q_list.length - 1))];

        }
        s.dialogData.q = q;

        builder.Prompts.choice(s, new builder.Message(s)
            .text(q.q)
            .suggestedActions(
            builder.SuggestedActions.create(
                s, q.options.map(o => {
                    return builder.CardAction.imBack(s, o, o)
                })
            )),
            q.options
        );
    },
    (s, r) => {
        s.dialogData.answers = [];
        if (r.response.entity === s.dialogData.q.a) {
            s.send(`${s.message.from.name} 答對了! 加一分！`)
            s.send(new builder.Message(s).addAttachment(new Sticker(s, 1, 2)));
            s.dialogData.q = null
        } else {
            s.send(`${s.message.from.name} 答錯了! 扣一分！`)
            s.send(new builder.Message(s).addAttachment(new Sticker(s, 1, 3)));
        }
        s.replaceDialog("ask", { q: s.dialogData.q })
    }
])

bot.dialog("slice", [
    s => {
        console.log("log")
    }
]).triggerAction({
    matches: /^slice$/i
});

bot.dialog("leave", [
    s => {
        console.log("leave");
        connector.leave();
    }
]).triggerAction({
    matches: /^leave$/i
});