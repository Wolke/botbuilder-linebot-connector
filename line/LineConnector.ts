
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
    hasPushApi = false;

    //from dispatch
    replyToken;
    options;
    conversationId;
    event_cache = [];

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
        if (this.options.hasPushApi !== undefined) {
            this.hasPushApi = this.options.hasPushApi;
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

    addReplyToken(replyToken) {

        const _this = this;
        _this.replyToken = replyToken;
        console.log("addReplyToken1", _this.replyToken, _this.event_cache)

        setTimeout(() => {
            console.log("addReplyToken2", _this.replyToken)
            if (_this.replyToken && _this.event_cache.length > 0) {
                _this.reply(_this.replyToken, _this.event_cache);
            }
            _this.replyToken = null;
            _this.event_cache = [];

        }, 1000)
    }
    dispatch(body, res) {
        // console.log("dispatch")
        const _this = this;
        if (!body || !body.events) {
            return;
        }
        body.events.forEach(event => {
            // console.log("event", event)
            _this.addReplyToken(event.replyToken)

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
                    _this.conversationId = event.source.userId;


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
                    _this.conversationId = event.source.groupId;

                    m.address.channel.id = event.source.groupId;

                    break;
                case 'room':
                    m.address.conversation.name = "room";
                    m.address.conversation.id = event.source.roomId;
                    _this.conversationId = event.source.roomId;

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

                case 'unfollow':

                    m.id = event.source.userId;
                    m.type = 'conversationUpdate'

                    break;

                case 'join':
                    m.type = 'conversationUpdate'

                    break;

                case 'leave':
                    m.type = 'conversationUpdate'
                    break;
                case 'postback':

                    let data = event.postback.data;
                    if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                        data += `(${JSON.stringify(event.postback.params)})`;
                    }

                    break;
                case 'beacon':
                    break;

                default:
                    throw new Error(`Unknown event: ${JSON.stringify(event)}`);
                    break;
            }
            console.log("m", m)
            _this.handler([m]);

        })
    }
    onEvent(handler) {
        this.handler = handler;
    };
    static createMessages(message) {
        // console.log(message)
        if (typeof message === 'string') {
            return [{ type: 'text', text: message }];
        }

        if (Array.isArray(message)) {
            return message.map(function (m) {
                if (typeof m === 'string') {
                    return { type: 'text', text: m };
                }
                return m;
            });
        }
        return [message];
    }
    post(path, body) {
        // console.log(path, body)
        let r;
        try {
            r = fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
        } catch (er) {
            console.log(er)
        }
        return r
    }
    reply(replyToken, message) {

        let m = LineConnector.createMessages(message);
        const body = {
            replyToken: replyToken,
            messages: m
        };
        console.log("reply", replyToken, body)

        return this.post('/message/reply', body).then(function (res) {
            return res.json();
        });
    }

    push(toId, message) {
        let m = LineConnector.createMessages(message);

        const body = {
            to: toId,
            messages: m
        };
        console.log("body", body)
        return this.post('/message/push', body).then(function (res) {
            return res.json();
        });
    }

    getRenderTemplate(event) {
        var _this = this;
        // console.log("getRenderTemplate", event)
        //20170825 should be there
        switch (event.type) {
            case 'message':
                if (event.text) {
                    return {
                        type: 'text',
                        text: event.text
                    }
                }
        }
    }
    send(messages, done) {
        // let ts = [];
        const _this = this;

        messages.map(e => {
            // console.log("e", e)
            if (_this.hasPushApi) {
                _this.push(_this.conversationId, _this.getRenderTemplate(e))
            } else if (_this.replyToken) {
                _this.event_cache.push(_this.getRenderTemplate(e))
                if (_this.event_cache.length === 5) {
                    _this.reply(_this.replyToken, _this.event_cache);
                    _this.replyToken = null;
                    _this.event_cache = [];
                }
            } else {
                throw `no way to send message: ` + e
            }
        })
    }
    startConversation(address, callback) {
        console.log(address);
        console.log(callback);
    }

}