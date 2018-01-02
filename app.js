"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var builder = require("botbuilder");
var istorage = require("./lib/IStorageClient");
var azure = require("./lib/AzureBotStorage.js");
var LineConnector_1 = require("./line/LineConnector");
var botbuilder_1 = require("botbuilder");
var HeroCardName = 'Hero card';
var ThumbnailCardName = 'Thumbnail card';
var ReceiptCardName = 'Receipt card';
var SigninCardName = 'Sign-in card';
var AnimationCardName = "Animation card";
var VideoCardName = "Video card";
var AudioCardName = "Audio card";
var CardNames = [HeroCardName, ThumbnailCardName, ReceiptCardName, SigninCardName, AnimationCardName, VideoCardName, AudioCardName];
var server = express();
server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});
var docDbClient = new istorage.IStorageClient();
var tableStorage = new azure.AzureBotStorage({
    gzipData: false
}, docDbClient);
var connector = new LineConnector_1.LineConnector({
    hasPushApi: false,
    // Miss Tarot 塔羅小姐
    channelId: process.env.channelId || "1487202031",
    channelSecret: process.env.channelSecret || "64078989ba8249519163b052eca6bc58",
    channelAccessToken: process.env.channelAccessToken || "QELaTKb+JpKNt+LndfixVD8EA+DGID5wgvZ10skM3F2nPPzvTC7ZpvxQ3onkR+hu06eRv1S+NG6Cfyw3EtfW21K6x6RGBRqf8ehPYUalja77myU10cSBR9GmYA/HDri9jDg5YqDHUVg5JCrkb+nnygdB04t89/1O/w1cDnyilFU="
});
server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector).set('storage', tableStorage); //set your storage here
bot.dialog('/', [
    function (s) {
        s.send("hi");
        var m = new builder.Message(s)
            .text("hello world")
            .suggestedActions(builder.SuggestedActions.create(s, [
            new botbuilder_1.CardAction().type("datatimepicker").title("time"),
            new builder.CardAction().title("1").type("message").value("1"),
        ]));
        s.send(m);
        // var msg = new builder.Message(s);
        // msg.attachmentLayout(builder.AttachmentLayout.carousel)
        // msg.attachments([
        //     new builder.HeroCard(s)
        //         .title("Classic White T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
        //         .buttons([
        //             builder.CardAction.openUrl(s, "https://1797.tw", "1797"),
        //             new CardAction().type("datatimepicker").title("time"),
        //             builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
        //         ]),
        //     new builder.HeroCard(s)
        //         .title("Classic Gray T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
        //         .buttons([
        //             new CardAction().type("datatimepicker").title("time"),
        //             builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
        //             builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
        //         ])
        // ]);
        // try {
        //     builder.Prompts.text(s, msg);
        // } catch (e) {
        //     console.log(e)
        // }
    },
]);
bot.dialog('/profile', [
    function (session) {
        console.log("/profile");
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        console.log("results.response==>", results.response);
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.on('conversationUpdate', function (message) {
    console.log("conversationUpdate", message);
    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : "Hello...";
        var reply = new builder.Message()
            .address(message.address)
            .text(txt);
        bot.send(reply);
    }
    else if (message.membersRemoved) {
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
//# sourceMappingURL=app.js.map