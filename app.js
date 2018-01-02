"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var builder = require("botbuilder");
var istorage = require("./lib/IStorageClient");
var azure = require("./lib/AzureBotStorage.js");
var LineConnector_1 = require("./line/LineConnector");
var botbuilder_1 = require("botbuilder");
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
        var m = new builder.Message(s)
            .text("hello world")
            .suggestedActions(builder.SuggestedActions.create(s, [
            new botbuilder_1.CardAction().type("datatimepicker").title("time"),
            new builder.CardAction().title("1").type("message").value("1"),
        ]));
        s.send(m);
        s.send(new builder.Message(s)
            .addAttachment(new LineConnector_1.Sticker(s, 1, 1))
            .addAttachment(new LineConnector_1.Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203))
            .addAttachment(new builder.HeroCard(s)
            .title("Classic White T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
            .buttons([
            builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
            new botbuilder_1.CardAction().type("datatimepicker").title("time"),
            builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
            builder.CardAction.openUrl(s, "https://1797.tw", "1797")
        ])));
        var msg = new builder.Message(s);
        msg.attachmentLayout(builder.AttachmentLayout.carousel);
        msg.attachments([
            new builder.HeroCard(s)
                .title("Classic White T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
                .buttons([
                builder.CardAction.openUrl(s, "https://1797.tw", "1797"),
                new botbuilder_1.CardAction().type("datatimepicker").title("time"),
                builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
            ]),
            new builder.HeroCard(s)
                .title("Classic Gray T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
                .buttons([
                new botbuilder_1.CardAction().type("datatimepicker").title("time"),
                builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
            ])
        ]);
        builder.Prompts.text(s, msg);
    },
    function (s, r) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            s.send("hola:" + s.message.from.name + r.response);
            return [2 /*return*/];
        });
    }); }
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
        builder.Prompts.text(s, "go");
    },
    function (s, r) {
        s.send("oh!" + r.response);
        s.endDialog();
    }
]);
//# sourceMappingURL=app.js.map