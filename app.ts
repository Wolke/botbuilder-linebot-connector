var express = require('express');
import * as builder from "botbuilder";
import * as  istorage from "./lib/IStorageClient";
import * as  azure from './lib/AzureBotStorage.js';
import * as  conf from './config/conf.js'
import { LineConnector, Sticker, Location } from "./line/LineConnector"
import { CardAction } from "botbuilder";

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



var connector = new LineConnector({
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
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (s, results) {
        // s.send('Hello 1 %s!', s.userData.name);

        // s.send(new builder.Message(s).addAttachment(createCard(HeroCardName, s)));
        // s.send(new builder.Message(s).addAttachment(new builder.VideoCard(s)
        //     .title('I am your father')
        //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
        //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
        //     .image(builder.CardImage.create(s, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
        //     .media([
        //         {
        //             profile: "",
        //             url: 'https://r5---sn-q4fl6nlz.googlevideo.com/videoplayback?type=video%252Fmp4%253B%2Bcodecs%253D%2522avc1.42001E%252C%2Bmp4a.40.2%2522&itag=18&mime=video%2Fmp4&signature=15262E19CDA68907F67AF1BDA510ED680779312F.7668948A815A7EEE6096C4EA2D3FA51AFFC9C6E9&requiressl=yes&ratebypass=yes&expire=1514641294&sparams=clen,dur,ei,expire,gir,id,ip,ipbits,ipbypass,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&lmt=1499188788353330&key=cms1&ip=185.27.132.170&source=youtube&dur=80.735&id=o-AJw9vrjMVrWkiKdBYaXA12dDWFYeMPVtQvUFfa5R_bty&ipbits=0&clen=5625113&gir=yes&pl=21&ei=LkNHWpO8IMviVLSNkuAD&quality=medium&title=NEW%2BKate%2BUpton%2BBikini%2BVideo%2BShoot%2B%255B2015%255D&rm=sn-aigely76&req_id=1ea7dc171019a3ee&ipbypass=yes&mip=114.37.190.191&cm2rm=sn-ipoxu-un5k76,sn-un5l76&redirect_counter=3&cms_redirect=yes&mm=34&mn=sn-q4fl6nlz&ms=ltu&mt=1514619623&mv=m'
        //         }
        //     ])))

        // s.send(new builder.Message(s).addAttachment(new builder.AudioCard(s)
        //     .title('I am your father')
        //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
        //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
        //     .image(builder.CardImage.create(s, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
        //     .media([
        //         {
        //             profile: "",
        //             url: 'https://d40cb5d7.ngrok.io/acord.m4a'
        //         }
        //     ])
        // ))
        //     s.send(new builder.Message(s).addAttachment(new builder.MediaCard(s)
        //     .title('I am your father')
        //     .subtitle('Star Wars: Episode V - The Empire Strikes Back')
        //     .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
        //     .image(builder.CardImage.create(s, 'https://s.yimg.com/ny/api/res/1.2/bSlNYXoNEDzFGweVwgR4lA--/YXBwaWQ9aGlnaGxhbmRlcjtzbT0xO3c9ODAw/http://media.zenfs.com/zh-Hant-TW/homerun/mirrormedia.mg/df4ea57c8bc14ff4c1817ef04a2a7b49'))
        // ))
        s.send(new builder.Message(s)
            // .addAttachment(
            // new Sticker(s, 1, 1)
            // )
            // .addAttachment(
            // new Location(s, "my test", "中和", 35.65910807942215, 139.70372892916203)
            // )
            .addAttachment(
            new builder.HeroCard(s)
                .title("Classic White T-Shirt")
                .subtitle("100% Soft and Luxurious Cotton")
                .text("Price is $25 and carried in sizes (S, M, L, and XL)")
                .buttons([
                    // builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy"),
                    new CardAction().type("datatimepicker").title("time"),

                    // builder.CardAction.postBack(s, "action=buy&itemid=111", "send data"),
                    builder.CardAction.openUrl(s, "https://1797.tw", "1797")

                ])
            )

        )

        // var msg = new builder.Message(s);
        // msg.attachmentLayout(builder.AttachmentLayout.carousel)
        // msg.attachments([
        //     new builder.HeroCard(s)
        //         .title("Classic White T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/11/b9/11b93df1ec7012f4d772c8bb0ac74e10.png')])
        //         .buttons([
        //             builder.CardAction.imBack(s, "buy classic white t-shirt", "Buy")
        //         ]),
        //     new builder.HeroCard(s)
        //         .title("Classic Gray T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(s, 'https://imagelab.nownews.com/?w=1080&q=85&src=http://s.nownews.com/5d/6b/5d6b74b674e643f522ed68ef83053a1f.JPG')])
        //         .buttons([
        //             builder.CardAction.imBack(s, "buy classic gray t-shirt", "Buy")
        //         ])
        // ]);
        // s.send(msg)
    }
]);

bot.dialog('/profile', [
    function (session) {
        console.log("/profile")
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        console.log("results.response==>", results.response);
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.on('conversationUpdate', function (message) {
    console.log("conversationUpdate")

    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : "Hello...";
        var reply = new builder.Message()
            .address(message.address)
            .text(txt);
        bot.send(reply);
    } else if (message.membersRemoved) {
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