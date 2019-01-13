var express = require('express');
import * as builder from "botbuilder";
import { LineConnector, Sticker, Location, ImageMap } from "./line/LineConnector"
import { CardAction } from "botbuilder";

// var config = require("./conf").default

var server = express();
server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log("listening to");
});

var connector = new LineConnector({
    hasPushApi: false, //you need to pay push api >.,<
    autoGetUserProfile: true,
    channelId: "1489577982",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165a18c",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilFU="
});

server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector)

bot.dialog('/', [
    s => {
        // s.send(s.message.text)
        s.send(new builder.Message(s).addAttachment(new ImageMap(s,
            "test",
            "https://www.profolio.com/sites/default/files/styles/1920x1040/public/field/image/Bikini_Girls_adx.jpg?itok=uciEvomy",
            {
                "width": 1040,
                "height": 1040
            },
            [
                {
                    "type": "uri",
                    "linkUri": "https://google.com/",
                    "area": {
                        "x": 0,
                        "y": 0,
                        "width": 333,
                        "height": 1040
                    }
                },
                {
                    "type": "message",
                    "label": "good",
                    "text": "hot",
                    "area": {
                        "x": 333,
                        "y": 0,
                        "width": 333,
                        "height": 1040
                    }
                },
            ]


        )));

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
        // s.send(new ImageMap(s))
        builder.Prompts.text(s, "go");
    },
    (s, r) => {
        s.send("oh!" + r.response)
        s.endDialog()
    }
])