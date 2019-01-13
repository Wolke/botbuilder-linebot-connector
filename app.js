"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var builder = require("botbuilder");
var LineConnector_1 = require("./line/LineConnector");
// var config = require("./conf").default
var server = express();
server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log("listening to");
});
var connector = new LineConnector_1.LineConnector({
    hasPushApi: false,
    autoGetUserProfile: true,
    channelId: "1489577982",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165a18c",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilFU="
});
server.post('/line', connector.listen());
// var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
bot.dialog('/', [
    function (s) {
        // s.send(s.message.text)
        s.send(new builder.Message(s).addAttachment(new LineConnector_1.ImageMap(s)));
    }
]);
bot.dialog('leave', function (s) {
    s.send("byebye");
    connector.leave();
    s.endDialog();
}).triggerAction({
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
    bot.beginDialog(message.address, "hello");
});
bot.dialog("hello", [
    function (s) {
        // s.send(new ImageMap(s))
        builder.Prompts.text(s, "go");
    },
    function (s, r) {
        s.send("oh!" + r.response);
        s.endDialog();
    }
]);
//# sourceMappingURL=app.js.map