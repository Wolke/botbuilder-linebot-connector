var express = require('express');
import * as builder from "botbuilder";
import { LineConnector, Sticker, Location, ImageMap } from "./line/LineConnector"
// var LineConnector = require("./../index");
import { CardAction } from "botbuilder";

// var config = require("./conf").default

var server = express();
server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log("listening to");
});

var connector = new LineConnector({
    hasPushApi: true, //you need to pay push api >.,<
    autoGetUserProfile: false,
    channelId: "LINE-CHANNE-ID",
    channelSecret: "LINE-CHANNEL-SECRET",
    channelAccessToken: "LINE-CHANNEL-ACCESS-TOKEN"
});

server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector)

bot.dialog('/', [
    async (s) => {
        let a: any = s.message.address
        console.log(a)

        let r = await connector.getUserProfile(a.channelId)
        console.log("r", r)

        // s.message.address
        s.send(new builder.Message(s).addAttachment(new ImageMap(
            "test",
            "https://www.profolio.com/sites/default/files/styles/1920x1040/public/field/image/Bikini_Girls_adx.jpg?itok=uciEvomy",
            {
                "width": 1040,
                "height": 1040
            },
            ImageMap.getImageMapActions(ImageMap.ONE_IMAGE, 1040, 1040, ["https://google.com"])
            // [
            //     {
            //         "type": "uri",
            //         "linkUri": "https://google.com/",
            //         "area": {
            //             "x": 0,
            //             "y": 0,
            //             "width": 333,
            //             "height": 1040
            //         }
            //     },
            //     {
            //         "type": "message",
            //         "label": "good",
            //         "text": "hot",
            //         "area": {
            //             "x": 333,
            //             "y": 0,
            //             "width": 333,
            //             "height": 1040
            //         }
            //     },
            // ]
        )))
        // s.send(s.message.text)
        // s.send(new builder.Message(s).addAttachment(new ImageMap(s,
        //     "test",
        //     "https://www.profolio.com/sites/default/files/styles/1920x1040/public/field/image/Bikini_Girls_adx.jpg?itok=uciEvomy",
        //     {
        //         "width": 1040,
        //         "height": 1040
        //     },
        //     [
        //         {
        //             "type": "uri",
        //             "linkUri": "https://google.com/",
        //             "area": {
        //                 "x": 0,
        //                 "y": 0,
        //                 "width": 333,
        //                 "height": 1040
        //             }
        //         },
        //         {
        //             "type": "message",
        //             "label": "good",
        //             "text": "hot",
        //             "area": {
        //                 "x": 333,
        //                 "y": 0,
        //                 "width": 333,
        //                 "height": 1040
        //             }
        //         },
        //     ]


        // )));

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



// var a = {
//     conversation: { name: 'user', id: 'U4d84576ad6728b67714cfef79650e6fb' },
//     channel: { id: 'U4d84576ad6728b67714cfef79650e6fb', source: 'line' },
//     user: { name: 'user', id: 'U4d84576ad6728b67714cfef79650e6fb' },
//     channelId: 'U4d84576ad6728b67714cfef79650e6fb'
// }
// var reply = new builder.Message()
//     .address(<any>a)
//     // .addAttachment(new Sticker(1, 1))
//     // .text("hello2")
//     .addAttachment(new ImageMap(
//         "test",
//         "https://www.profolio.com/sites/default/files/styles/1920x1040/public/field/image/Bikini_Girls_adx.jpg?itok=uciEvomy",
//         {
//             "width": 1040,
//             "height": 1040
//         },
//         []
//     ))
// bot.send(reply);