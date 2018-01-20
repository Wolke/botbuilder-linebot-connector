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


LINE Messaging API for Node.js

# About LINE Messaging API

Please refer to the official API documents for details.
- Developer Documents - https://developers.line.me/messaging-api/overview
- API Reference - https://devdocs.line.me/en/#messaging-api

# Installation

```bash
npm install --save botbuilder-linebot-connector
```

## Code Sample
```js
//java script
var builder = require("botbuilder")
var LineConnector = require("botbuilder-linebot-connector");

var express = require('express');
var server = express();

server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});


var connector = new LineConnector.LineConnector({
    hasPushApi: false, //you have to pay for push api >.,<
    // your line
    channelId: process.env.channelId || "",
    channelSecret: process.env.channelSecret || "",
    channelAccessToken: process.env.channelAccessToken || ""
});

server.post('/line', connector.listen());

var bot = new builder.UniversalBot(connector)

bot.dialog("/", s => {
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

```ts
//type script
var express = require('express');
import * as builder from "botbuilder";
import { LineConnector, Sticker, Location } from "botbuilder-linebot-connector"
import { CardAction } from "botbuilder";
var server = express();
server.listen(process.env.port || process.env.PORT || 3980, function () {
    console.log("listening to");
});


var connector = new LineConnector({
    hasPushApi: false, //you to pay for push api >.,<
    // your line
    channelId: process.env.channelId || "",
    channelSecret: process.env.channelSecret || "",
    channelAccessToken: process.env.channelAccessToken || ""
});

server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector)

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
            /* Sticker  */
          
          .addAttachment(
            new Sticker(s, 1, 1)
            )
            /* Location  */
          
            .addAttachment(
            new Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203)
            )
            /* Audio file */
            .addAttachment(
                new builder.AudioCard(s).media([{
                    url:"https://xxx", //file place must be https
                    profile:"music"
                }])
            )
            /* Image file */
            ).addAttachment(
                new builder.MediaCard(s).image(builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG'))
            
              /* Video file */
            ).addAttachment(
                new builder.MediaCard(s).media('https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG').image(builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG'))
            )
        )

              /* Dialog */
          
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
    // console.log("conversationUpdate", message)
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

  [MIT](LICENSE)

[express-url]: http://expressjs.com
[webhook-event-url]: https://devdocs.line.me/en/#webhook-event-object
[send-message-url]: https://devdocs.line.me/en/#send-message-object

[npm-url]: https://www.npmjs.com/package/botbuilder-linebot-connector
