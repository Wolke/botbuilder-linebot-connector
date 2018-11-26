# botbuilder-linebot-connector
Microsoft Bot Framework V3 connector for Line office account

[![npm version](https://badge.fury.io/js/botbuilder-linebot-connector.svg)](https://badge.fury.io/js/botbuilder-linebot-connector)
[![dependencies Status](https://david-dm.org/Wolke/botbuilder-linebot-connector/status.svg)](https://david-dm.org/Wolke/botbuilder-linebot-connector)


## Features

* ready for Microsoft Bot Framework V3
* **no need a registered bot** on [dev.botframework.com](https://dev.botframework.com/), but require a certified line developer account, go to apply [trial account](https://developers.line.me/en/)
* depend on [line](https://developers.line.me/en/) and [line-message-api](https://developers.line.me/en/services/messaging-api/) packages
* support receiving and sending almost any line message types
* for [express](http://expressjs.com/) framework
* serverless framework support - connector.serverlessWebhock(event)

LINE Messaging API for Node.js

# About LINE Messaging API

Please refer to the official API documents for details.
- Developer Documents - https://developers.line.me/messaging-api/overview
- API Reference - https://devdocs.line.me/en/#messaging-api

# Installation

```bash
npm install --save botbuilder-linebot-connector
```

## Donate; Buy me a Beer

If you want to thank me, or promote your Issue.


[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/wolkesau/1)

> Sorry, but I have work and support for packages requires some time after work. I will be glad of your support and PR's.


## Document
- 使用 botframework + botbuilder-linebot-connector + serverless(AWS lambda) + botbuilder-mongodb-storage 連 mongodb cluster 開發 LineBot 入門 1 - http://wolke-codes.blogspot.tw/2018/02/botframework-botbuilder-linebot.html
- 使用 botframework + botbuilder-linebot-connector + serverless(AWS lambda) + botbuilder-mongodb-storage 連 mongodb cluster 開發 LineBot 入門 2 - 
http://wolke-codes.blogspot.tw/2018/02/botframework-botbuilder-linebot_10.html

## Code Sample
- example express - https://github.com/Wolke/botbuilder-linebot-connector-example
- example serverless - https://github.com/Wolke/linebot-serverless-MongoDbStorage-LineConnector-typeScript-starter-Kit

### javaScript

```js
var builder = require("botbuilder")
var LineConnector = require("botbuilder-linebot-connector");

var express = require('express');
var server = express();

server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});


var connector = new LineConnector.LineConnector({
    hasPushApi: false, //you have to pay for push api >.,<
    autoGetUserProfile:true, //default is false
    // your line
    channelId: process.env.channelId || "",
    channelSecret: process.env.channelSecret || "",
    channelAccessToken: process.env.channelAccessToken || ""
});

server.post('/line', connector.listen());

var bot = new builder.UniversalBot(connector)

bot.dialog("/", s => {
            try{
                let u = await connector.getUserProfile(s.message.from.id)
                console.log("u" + u)
                if (u === undefined) {
                    s.send("who said:" + s.message.text)
                } else {
                    s.send("hello " + u.displayName)
                }
            }catch(e){
                s.send("can`t get user profile!")
            }

    console.log("s.message",s.message)
//         s.message { timestamp: '2018-02-08T13:31:33.333Z',
//   source: 'line',
//   address: 
//    { conversation:
//       { name: 'room', // room , group , user
//         id: 'Rf5e5a95cd35d35a9a9d954ff4df3ff4d',
//         isGroup: true }, / room or group will be true
//      channel: { id: 'Rf5e5a95cd35d35a9a9d954ff4df3ff4d' },
//      user: { name: 'room', id: 'Rf5e5a95cd35d35a9a9d954ff4df3ff4d' } },
//   from: // 
//    { id: 'Ub2da2efe8838ade6f5319b55500ea606', 
//      name: '綠蓋茶', // autoGetUserProfile<==set true , and must add friend before, or get undefined below
//      pictureUrl: 'http://dl.profile.line-cdn.net/0h_18pqKOFAB4FCSxKUJx_STlMDnNyJwZWfWxLenIPCSsgMUdIPmdHeHBeWCYtOkZBaz0afXMLXid4',
//      statusMessage: undefined },
//   id: '7442942284795',
//   type: 'message',
//   text: '你好',
//   agent: 'botbuilder',
//   user: { name: 'room', id: 'Rf5e5a95cd35d35a9a9d954ff4df3ff4d' } }
    s.send(new builder.Message(s)
        /* Sticker  */
        .addAttachment(
            new LineConnector.Sticker(s, 1, 1)
        )
        /* Location  */
        .addAttachment(
            new LineConnector.Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203)
        )
        /* Audio file */
        .addAttachment(
            new builder.AudioCard(s).media([{
                url: "https://xxx", //file place must be https
                profile: "music"
            }])
            /* Image file */
        ).addAttachment(
            new builder.MediaCard(s).image(builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG'))
            /* Video file */
        ).addAttachment(
            new builder.MediaCard(s).media('https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG').image(builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG'))
        )
    );


    /* Dialog */
    s.send(new builder.Message(s)
        .addAttachment(
            new builder.HeroCard(s)

            .title("Classic White T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])

            .buttons([
                //left text message
                builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                //set timer
                new builder.CardAction().type("datatimepicker").title("time"),
                //postback
                builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                //open irl
                builder.CardAction.openUrl(s, "https://1797.tw", "1797")

            ])
        )
    )
        /* Carosuel */
          
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
                    new builder.CardAction().type("datatimepicker").title("time"),
                    builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                ]),
            new builder.HeroCard(s)
                .title("Classic Gray T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
                .buttons([
                    new builder.CardAction().type("datatimepicker").title("time"),
                    builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                    builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                ])
        ]);
        s.send(msg)


})


bot.dialog('leave'
    , s => {
        s.send("byebye");
        //only work in group or room
        connector.leave();

        s.endDialog()

    }
).triggerAction({
    matches: /^leave$/i
});

bot.on('conversationUpdate', function (message) {
    // detect event
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
    bot.beginDialog(message.address, "hello")
});

bot.dialog("hello", [
    s => {
        builder.Prompts.text(s, "go");
    },
    (s, r) => {
        s.send("oh!" + r.response)
        s.endDialog()
    }
])

```
# License

The MIT license

[express-url]: http://expressjs.com
[webhook-event-url]: https://devdocs.line.me/en/#webhook-event-object
[send-message-url]: https://devdocs.line.me/en/#send-message-object

[npm-url]: https://www.npmjs.com/package/botbuilder-linebot-connector

# Messaging API SDKs
[line-bot-sdk]: https://developers.line.biz/en/docs/messaging-api/line-bot-sdk/


#If you like this, Welcome to give me Star
