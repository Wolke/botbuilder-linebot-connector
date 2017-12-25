
const fetch = require('node-fetch');
const crypto = require('crypto');
var url = require('url');

import bodyParser = require("body-parser");
import * as botbuilder from "botbuilder";
export class LineConnector implements botbuilder.IConnector {
    //const
    headers;
    endpoint;
    botId;

    //from dispatch
    replyToken;
    options;
    userId;

    //form botframework
    handler;

    constructor(options) {
        this.options = options || {};
        this.options.channelId = options.channelId || '';
        this.options.channelSecret = options.channelSecret || '';
        this.options.channelAccessToken = options.channelAccessToken || '';
        if (this.options.verify === undefined) {
            this.options.verify = true;
        }
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.options.channelAccessToken
        };
        this.endpoint = 'https://api.line.me/v2/bot';
        this.botId = options.channelId;
    }
    verify(rawBody, signature) {
        const hash = crypto.createHmac('sha256', this.options.channelSecret)
            .update(rawBody, 'utf8')
            .digest('base64');
        return hash === signature;
    }
    listen() {
        // console.log("listen")
        const parser = bodyParser.json({
            verify: function (req: any, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return (req, res) => {

            parser(req, res, () => {

                if (this.options.verify && !this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                this.dispatch(req.body, res);
                return res.json({});
            });
        };
    }
    dispatch(body, res) {
        // console.log("dispatch")
        const _this = this;
        if (!body || !body.events) {
            return;
        }
        body.events.forEach(event => {
            console.log("event", event)
            _this.replyToken = event.replyToken;

            let m: any = {
                timestamp: new Date(parseInt(event.timestamp)).toISOString(),
                address: {
                    conversation: {},
                    channel: {},
                    user: {}
                }
            }
            switch (event.source.type) {
                case 'user':
                    m.address.conversation.name = "user";
                    m.address.conversation.id = event.source.userId;
                    m.address.channel.id = event.source.userId;
                    m.address.user.name = "user";
                    m.address.user.id = event.source.userId;


                    m.from = {
                        id: event.source.userId,
                        name: "user"
                    }
                    break;
                case 'group':
                    m.address.conversation.name = "group";
                    m.address.conversation.id = event.source.groupId;
                    m.address.channel.id = event.source.groupId;

                    break;
                case 'room':
                    m.address.conversation.name = "room";
                    m.address.conversation.id = event.source.roomId;
                    m.address.channel.id = event.source.roomId;

                    break;
            }
            switch (event.type) {
                case 'message':
                    m.id = event.message.id;

                    m.type = 'message'

                    const message = event.message;

                    switch (message.type) {
                        case 'text':
                            m.text = event.message.text
                            break;
                        case 'image':
                            m.attachments = [{
                                contentType: "image", contentUrl: "", name: ""
                            }];
                            break;
                        case 'video':
                            m.attachments = [{
                                contentType: "video", contentUrl: "", name: ""
                            }];
                            break;
                        case 'audio':
                            m.attachments = [{
                                contentType: "audio", contentUrl: "", name: ""
                            }];
                            break;
                        case 'location':
                            m.attachments = [{
                                "type": "location",
                                "id": event.message.id,
                                "latitude": event.message.latitude,
                                "longitude": event.message.longitude
                            }];

                            break;
                        case 'sticker':
                            m.attachments = [{
                                contentType: "sticker", contentUrl: "", name: ""
                            }];

                            break;
                        default:
                            throw new Error(`Unknown message: ${JSON.stringify(message)}`);
                            break;
                    }

                    break;
                case 'follow':
                    m.id = event.source.userId;

                    m.type = 'conversationUpdate'

                    break;
                //   return replyText(event.replyToken, 'Got followed event');

                case 'unfollow':

                    m.id = event.source.userId;
                    m.type = 'conversationUpdate'

                    break;
                //   return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

                case 'join':
                    m.type = 'conversationUpdate'

                    break;
                //   return replyText(event.replyToken, `Joined ${event.source.type}`);

                case 'leave':
                    m.type = 'conversationUpdate'
                    break;
                //   return console.log(`Left: ${JSON.stringify(event)}`);
                case 'postback':

                    let data = event.postback.data;
                    if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                        data += `(${JSON.stringify(event.postback.params)})`;
                    }
                    //   return replyText(event.replyToken, `Got postback: ${data}`);

                    break;
                case 'beacon':
                    break;
                //   return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

                default:
                    throw new Error(`Unknown event: ${JSON.stringify(event)}`);
                    break;
            }
            console.log("m",m)
            _this.handler([m]);

        })
    }
    onEvent(handler) {
        console.log(handler)
        this.handler = handler;
    };
    send(messages, done) {

    }
    startConversation(address, callback) {
        console.log(address);
        console.log(callback);
    }

}