"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require('node-fetch');
var crypto = require('crypto');
var url = require('url');
var bodyParser = require("body-parser");
var LineConnector = /** @class */ (function () {
    function LineConnector(options) {
        this.hasPushApi = false;
        this.event_cache = [];
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
    LineConnector.prototype.verify = function (rawBody, signature) {
        var hash = crypto.createHmac('sha256', this.options.channelSecret)
            .update(rawBody, 'utf8')
            .digest('base64');
        return hash === signature;
    };
    LineConnector.prototype.listen = function () {
        var _this = this;
        // console.log("listen")
        var parser = bodyParser.json({
            verify: function (req, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return function (req, res) {
            parser(req, res, function () {
                if (_this.options.verify && !_this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                _this.dispatch(req.body, res);
                return res.json({});
            });
        };
    };
    LineConnector.prototype.addReplyToken = function (replyToken) {
        var _this = this;
        _this.replyToken = replyToken;
        console.log("addReplyToken1", _this.replyToken, _this.event_cache);
        setTimeout(function () {
            console.log("addReplyToken2", _this.replyToken);
            if (_this.replyToken && _this.event_cache.length > 0) {
                _this.reply(_this.replyToken, _this.event_cache);
            }
            _this.replyToken = null;
            _this.event_cache = [];
        }, 1000);
    };
    LineConnector.prototype.dispatch = function (body, res) {
        // console.log("dispatch")
        var _this = this;
        if (!body || !body.events) {
            return;
        }
        body.events.forEach(function (event) {
            // console.log("event", event)
            _this.addReplyToken(event.replyToken);
            var m = {
                timestamp: new Date(parseInt(event.timestamp)).toISOString(),
                address: {
                    conversation: {},
                    channel: {},
                    user: {}
                }
            };
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
                    };
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
                    m.type = 'message';
                    var message = event.message;
                    switch (message.type) {
                        case 'text':
                            m.text = event.message.text;
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
                            throw new Error("Unknown message: " + JSON.stringify(message));
                            break;
                    }
                    break;
                case 'follow':
                    m.id = event.source.userId;
                    m.type = 'conversationUpdate';
                    break;
                case 'unfollow':
                    m.id = event.source.userId;
                    m.type = 'conversationUpdate';
                    break;
                case 'join':
                    m.type = 'conversationUpdate';
                    break;
                case 'leave':
                    m.type = 'conversationUpdate';
                    break;
                case 'postback':
                    var data = event.postback.data;
                    if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                        data += "(" + JSON.stringify(event.postback.params) + ")";
                    }
                    break;
                case 'beacon':
                    break;
                default:
                    throw new Error("Unknown event: " + JSON.stringify(event));
                    break;
            }
            console.log("m", m);
            _this.handler([m]);
        });
    };
    LineConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };
    ;
    LineConnector.createMessages = function (message) {
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
    };
    LineConnector.prototype.post = function (path, body) {
        // console.log(path, body)
        var r;
        try {
            r = fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
        }
        catch (er) {
            console.log(er);
        }
        return r;
    };
    LineConnector.prototype.reply = function (replyToken, message) {
        var m = LineConnector.createMessages(message);
        var body = {
            replyToken: replyToken,
            messages: m
        };
        console.log("reply", replyToken, body);
        return this.post('/message/reply', body).then(function (res) {
            return res.json();
        });
    };
    LineConnector.prototype.push = function (toId, message) {
        var m = LineConnector.createMessages(message);
        var body = {
            to: toId,
            messages: m
        };
        console.log("body", body);
        return this.post('/message/push', body).then(function (res) {
            return res.json();
        });
    };
    LineConnector.prototype.getRenderTemplate = function (event) {
        var _this = this;
        // console.log("getRenderTemplate", event)
        switch (event.type) {
            case 'message':
                if (event.text) {
                    return {
                        type: 'text',
                        text: event.text
                    };
                }
        }
    };
    LineConnector.prototype.send = function (messages, done) {
        // let ts = [];
        var _this = this;
        messages.map(function (e) {
            // console.log("e", e)
            if (_this.hasPushApi) {
                _this.push(_this.conversationId, _this.getRenderTemplate(e));
            }
            else if (_this.replyToken) {
                _this.event_cache.push(_this.getRenderTemplate(e));
                if (_this.event_cache.length === 5) {
                    _this.reply(_this.replyToken, _this.event_cache);
                    _this.replyToken = null;
                    _this.event_cache = [];
                }
            }
            else {
                throw "no way to send message: " + e;
            }
        });
    };
    LineConnector.prototype.startConversation = function (address, callback) {
        console.log(address);
        console.log(callback);
    };
    return LineConnector;
}());
exports.LineConnector = LineConnector;
//# sourceMappingURL=LineConnector.js.map