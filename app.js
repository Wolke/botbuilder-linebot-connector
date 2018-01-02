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
        try {
            builder.Prompts.text(s, msg);
        }
        catch (e) {
            console.log(e);
        }
    },
    function (s, r) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            s.send("hola:" + s.message.from.name + r.response);
            return [2 /*return*/];
        });
    }); }
    // function (session, args, next) {
    //     console.log("/")
    //     if (!session.userData.name) {
    //         session.beginDialog('/profile');
    //     } else {
    //         next();
    //     }
    // },
    // function (s, results) {
    //     // s.send('Hello 1 %s!', s.userData.name);
    //     // s.send(new builder.Message(s).addAttachment(createCard(HeroCardName, s)));
    //     // s.send(new builder.Message(s).addAttachment(new builder.VideoCard(s)
    //     //     .title('I am your father')
    //     //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
    //     //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
    //     //     .image(builder.CardImage.create(s, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
    //     //     .media([
    //     //         {
    //     //             profile: "",
    //     //             url: 'https://r5---sn-q4fl6nlz.googlevideo.com/videoplayback?type=video%252Fmp4%253B%2Bcodecs%253D%2522avc1.42001E%252C%2Bmp4a.40.2%2522&itag=18&mime=video%2Fmp4&signature=15262E19CDA68907F67AF1BDA510ED680779312F.7668948A815A7EEE6096C4EA2D3FA51AFFC9C6E9&requiressl=yes&ratebypass=yes&expire=1514641294&sparams=clen,dur,ei,expire,gir,id,ip,ipbits,ipbypass,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&lmt=1499188788353330&key=cms1&ip=185.27.132.170&source=youtube&dur=80.735&id=o-AJw9vrjMVrWkiKdBYaXA12dDWFYeMPVtQvUFfa5R_bty&ipbits=0&clen=5625113&gir=yes&pl=21&ei=LkNHWpO8IMviVLSNkuAD&quality=medium&title=NEW%2BKate%2BUpton%2BBikini%2BVideo%2BShoot%2B%255B2015%255D&rm=sn-aigely76&req_id=1ea7dc171019a3ee&ipbypass=yes&mip=114.37.190.191&cm2rm=sn-ipoxu-un5k76,sn-un5l76&redirect_counter=3&cms_redirect=yes&mm=34&mn=sn-q4fl6nlz&ms=ltu&mt=1514619623&mv=m'
    //     //         }
    //     //     ])))
    //     // s.send(new builder.Message(s).addAttachment(new builder.AudioCard(s)
    //     //     .title('I am your father')
    //     //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
    //     //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
    //     //     .image(builder.CardImage.create(s, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
    //     //     .media([
    //     //         {
    //     //             profile: "",
    //     //             url: 'https://d40cb5d7.ngrok.io/acord.m4a'
    //     //         }
    //     //     ])
    //     // ))
    //     //     s.send(new builder.Message(s).addAttachment(new builder.MediaCard(s)
    //     //     .title('I am your father')
    //     //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
    //     //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
    //     //     .image(builder.CardImage.create(s, 'https://s.yimg.com/ny/api/res/1.2/bSlNYXoNEDzFGweVwgR4lA--/YXBwaWQ9aGlnaGxhbmRlcjtzbT0xO3c9ODAw/http://media.zenfs.com/zh-Hant-TW/homerun/mirrormedia.mg/df4ea57c8bc14ff4c1817ef04a2a7b49'))
    //     // ))
    //     // s.send(new builder.Message(s)
    //     //     // .addAttachment(
    //     //     // new Sticker(s, 1, 1)
    //     //     // )
    //     //     // .addAttachment(
    //     //     // new Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203)
    //     //     // )
    //     //     .addAttachment(
    //     //     new builder.HeroCard(s)
    //     //         .title("Classic White T-Shirt")
    //     //         .subtitle("100% Soft and Luxurious Cotton")
    //     //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
    //     //         .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
    //     //         .buttons([
    //     //             builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
    //     //             new CardAction().type("datatimepicker").title("time"),
    //     //             builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
    //     //             builder.CardAction.openUrl(s, "https://1797.tw", "1797")
    //     //         ])
    //     //     )
    //     // )
    //     var msg = new builder.Message(s);
    //     msg.attachmentLayout(builder.AttachmentLayout.carousel)
    //     msg.attachments([
    //         new builder.HeroCard(s)
    //             .title("Classic White T-Shirt")
    //             .subtitle("100% Soft and Luxurious Cotton")
    //             .text("Price is $25 and carried in sizes (S, M, L, and XL)")
    //             .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
    //             .buttons([
    //                 builder.CardAction.openUrl(s, "https://1797.tw", "1797"),
    //                 new CardAction().type("datatimepicker").title("time"),
    //                 builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
    //             ]),
    //         new builder.HeroCard(s)
    //             .title("Classic Gray T-Shirt")
    //             .subtitle("100% Soft and Luxurious Cotton")
    //             .text("Price is $25 and carried in sizes (S, M, L, and XL)")
    //             .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
    //             .buttons([
    //                 new CardAction().type("datatimepicker").title("time"),
    //                 builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
    //                 builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
    //             ])
    //     ]);
    //     s.send(msg)
    // }
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