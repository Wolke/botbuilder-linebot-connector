var express = require('express');
import * as builder from "botbuilder";
import * as  istorage from "./lib/IStorageClient";
import * as  azure from './lib/AzureBotStorage.js';
import * as  conf from './config/conf.js'
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
    hasPushApi: false, //should
    // Miss Tarot 塔羅小姐
    channelId: process.env.channelId || "1487202031",
    channelSecret: process.env.channelSecret || "64078989ba8249519163b052eca6bc58",
    channelAccessToken: process.env.channelAccessToken || "QELaTKb+JpKNt+LndfixVD8EA+DGID5wgvZ10skM3F2nPPzvTC7ZpvxQ3onkR+hu06eRv1S+NG6Cfyw3EtfW21K6x6RGBRqf8ehPYUalja77myU10cSBR9GmYA/HDri9jDg5YqDHUVg5JCrkb+nnygdB04t89/1O/w1cDnyilFU="
});

server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector).set('storage', tableStorage); //set your storage here

bot.dialog('/', [
    s => {

        let m = new builder.Message(s)
            .text("hello world")
            .suggestedActions(
            builder.SuggestedActions.create(
                s, [
                    new CardAction().type("datatimepicker").title("time"),
                    new builder.CardAction().title("1").type("message").value("1"),
                    // builder.CardAction.openUrl(s, "https://1797.tw", "1797"),
                    // builder.CardAction.postBack(s, "action=buy&itemid=111", "send data")

                ]
            ));
        s.send(m)
        s.send(new builder.Message(s)
            .addAttachment(
            new Sticker(s, 1, 1)
            )
            .addAttachment(
            new Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203)
            )
            .addAttachment(
            new builder.HeroCard(s)

                .title("Classic White T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])

                .buttons([
                    builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                    new CardAction().type("datatimepicker").title("time"),

                    builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                    builder.CardAction.openUrl(s, "https://1797.tw", "1797")

                ])
            )

        )
        var msg = new builder.Message(s);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([

            new builder.HeroCard(s)
                .title("Classic White T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
                .buttons([
                    builder.CardAction.openUrl(s, "https://1797.tw", "1797"),
                    new CardAction().type("datatimepicker").title("time"),
                    builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                ]),
            new builder.HeroCard(s)
                .title("Classic Gray T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
                .buttons([
                    new CardAction().type("datatimepicker").title("time"),
                    builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                    builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                ])
        ]);
        builder.Prompts.text(s, msg);
    },
    async (s, r) => {
        s.send("hola:" + s.message.from.name + r.response)
    }
]);

bot.dialog('leave'
    , s => {
        s.send("byebye");
        connector.leave();

        s.endDialog()

    }
).triggerAction({
    matches: /^leave$/i
});

bot.on('conversationUpdate', function (message) {
    console.log("conversationUpdate", message)
    switch (message.text) {
        case 'follow':
            break;
        case 'unfollow':
            break;
        case 'join':
            break;
        case 'leave':
            break;
    }
    var isGroup = message.address.conversation.isGroup;
    var txt = isGroup ? "Hello everyone!" : "Hello " + message.from.name;
    var reply = new builder.Message()
        .address(message.address)
        .text(txt);
    bot.send(reply);

});