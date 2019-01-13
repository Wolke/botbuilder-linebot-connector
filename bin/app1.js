"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
const builder = require("botbuilder");
// import { LineConnector, Sticker, Location, ImageMap } from "./../index"
var LineConnector = require("./../index");
// var config = require("./conf").default
var server = express();
server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log("listening to");
});
var connector = new LineConnector.LineConnector({
    hasPushApi: true,
    autoGetUserProfile: true,
    channelId: "1619224714",
    channelSecret: "559047bbef9fb95ee17aecb28901772b",
    channelAccessToken: "BDQorhMkgNRKFiCe7VFjEIirL3EOi+s9ZenYRmYupSSyUJSoZwxUKPIFlSKZfv3QOYwD73aUFTIZ6AmGZ3YkM9d+ChZKOKp8CYoaZZot3eNhuZyAumEUy5tN5pWYbQs/oz6g8ZTGK7ko/fi87stCUgdB04t89/1O/w1cDnyilFU="
});
var bot = new builder.UniversalBot(connector);
var a = {
    conversation: { name: 'user', id: 'U4d84576ad6728b67714cfef79650e6fb' },
    channel: { id: 'U4d84576ad6728b67714cfef79650e6fb', source: 'line' },
    user: { name: 'user', id: 'U4d84576ad6728b67714cfef79650e6fb' },
    channelId: 'U4d84576ad6728b67714cfef79650e6fb'
};
var reply = new builder.Message()
    .address(a)
    .addAttachment(new LineConnector.Sticker(a, 1, 1));
bot.send(reply);
//# sourceMappingURL=app1.js.map