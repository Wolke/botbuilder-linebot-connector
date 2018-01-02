var express = require('express');
import * as builder from "botbuilder";
import * as  istorage from "./lib/IStorageClient";
import * as  azure from './lib/AzureBotStorage.js';

import { LineConnector, Sticker, Location } from "./line/LineConnector"
import { CardAction } from "botbuilder";

var server = express();
server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});

var docDbClient = new istorage.IStorageClient();
var tableStorage = new azure.AzureBotStorage({
    gzipData: false
}, docDbClient);

var connector = new LineConnector({
    hasPushApi: false, //you need to pay push api >.,<
    // Miss Tarot 塔羅小姐
    channelId: process.env.channelId || "1487202031",
    channelSecret: process.env.channelSecret || "64078989ba8249519163b052eca6bc58",
    channelAccessToken: process.env.channelAccessToken || "QELaTKb+JpKNt+LndfixVD8EA+DGID5wgvZ10skM3F2nPPzvTC7ZpvxQ3onkR+hu06eRv1S+NG6Cfyw3EtfW21K6x6RGBRqf8ehPYUalja77myU10cSBR9GmYA/HDri9jDg5YqDHUVg5JCrkb+nnygdB04t89/1O/w1cDnyilFU="
});
server.post('/line', connector.listen());

// var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector).set('storage', tableStorage); //set your storage here

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

bot.dialog("start", [
    s => {
        console.log(1,s.conversationData.players)
        let m = new builder.Message(s)
            .text("遊戲開始")
            .suggestedActions(
            builder.SuggestedActions.create(
                s, [
                    builder.CardAction.postBack(s, "action=play", "要玩請點我"),
                    builder.CardAction.postBack(s, "action=start", "都按了，請開始")
                ]
            ));
        // s.send(m)
        builder.Prompts.text(s, m);

    },
    (s, r) => {
        // s.send("ok")
        s.conversationData.players ? "" : s.conversationData.players = [];
        s.conversationData.players.push(s.message.from.name)
        console.log(2,s.conversationData.players)
    
        s.replaceDialog("start")
    }
])
