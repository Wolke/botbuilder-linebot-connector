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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require('node-fetch');
var crypto = require('crypto');
var url = require('url');
var bodyParser = require("body-parser");
var botbuilder = require("botbuilder");
var VERIFY_TOKENS = [
    '00000000000000000000000000000000',
    'ffffffffffffffffffffffffffffffff'
];
var Sticker = /** @class */ (function () {
    function Sticker(session, packageId, stickerId) {
        this.packageId = packageId.toString();
        this.stickerId = stickerId.toString();
        this.session = session;
    }
    Sticker.prototype.toAttachment = function () {
        // throw new Error("Method not implemented.");
        // console.log(this.session.message)
        if (this.session.message && ((this.session.message.source && this.session.message.source === "line") || (this.session.message.address.channel.source && this.session.message.address.channel.source === "line"))) {
            // if (this.session.message && this.session.message.source && this.session.message.source === "line") {
            return {
                contentType: "sticker",
                content: {
                    packageId: this.packageId,
                    stickerId: this.stickerId
                }
            };
        }
        else {
            // throw new Error("Method not implemented.");
            return new botbuilder.MediaCard().text("this is a sticker!!").toAttachment();
        }
    };
    return Sticker;
}());
exports.Sticker = Sticker;
var Location = /** @class */ (function () {
    function Location(session, title, address_or_desc, latitude, longitude) {
        this.session = session;
        this.title = title;
        this.address = address_or_desc;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    Location.prototype.toAttachment = function () {
        if (this.session.message && ((this.session.message.source && this.session.message.source === "line") || (this.session.message.address.channel.source && this.session.message.address.channel.source === "line"))) {
            // if (this.session.message && this.session.message.source && this.session.message.source === "line") {
            return {
                contentType: "location",
                content: {
                    title: this.title,
                    address: this.address,
                    latitude: this.latitude,
                    longitude: this.longitude
                }
            };
        }
        else {
            // throw new Error("Method not implemented.");
            return new botbuilder.MediaCard().text("this is a location!! " + this.address).toAttachment();
        }
    };
    return Location;
}());
exports.Location = Location;
var LineConnector = /** @class */ (function () {
    function LineConnector(options) {
        this.hasPushApi = false;
        this.autoGetUserProfile = false;
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
        if (this.autoGetUserProfile !== undefined) {
            this.autoGetUserProfile = this.options.autoGetUserProfile;
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
        var _this_1 = this;
        console.log("listen");
        var parser = bodyParser.json({
            verify: function (req, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return function (req, res) {
            parser(req, res, function () {
                // if (this.options.verify && !this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                //     return res.sendStatus(400);
                // }
                _this_1.dispatch(req.body, res);
                return res.json({});
            });
        };
    };
    LineConnector.prototype.serverlessWebhock = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.dispatch(JSON.parse(event.body), null);
                return [2 /*return*/];
            });
        });
    };
    LineConnector.prototype.addReplyToken = function (replyToken) {
        var _this = this;
        _this.replyToken = replyToken;
        // console.log("addReplyToken1", _this.replyToken, _this.event_cache)
        this.timer = setTimeout(function () {
            // console.log("addReplyToken2", _this.replyToken)
            if (_this.replyToken && _this.event_cache.length > 0) {
                var r = (' ' + _this.replyToken).slice(1);
                _this.replyToken = null;
                _this.reply(r, _this.event_cache);
            }
            else if (_this.replyToken !== null) {
                console.log("wait for 2 seconds let will make replyToken no use, clean the replytoken");
            }
            _this.replyToken = null;
            _this.event_cache = [];
        }, 2000);
    };
    LineConnector.prototype.dispatch = function (body, res) {
        var _this_1 = this;
        console.log("dispatch");
        var _this = this;
        if (!body || !body.events) {
            console.log("dispatch return");
            return;
        }
        body.events.forEach(function (event) { return __awaiter(_this_1, void 0, void 0, function () {
            var m, r, e_1, message, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("event", event);
                        if (VERIFY_TOKENS.indexOf(event.replyToken) !== -1) {
                            return [2 /*return*/];
                        }
                        _this.addReplyToken(event.replyToken);
                        m = {
                            timestamp: new Date(parseInt(event.timestamp)).toISOString(),
                            source: "line",
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
                                m.address.channel.id = event.source.userId;
                                m.address.channel.source = "line";
                                m.address.user.name = "user";
                                m.address.user.id = event.source.userId;
                                _this.conversationId = event.source.userId;
                                break;
                            case 'group':
                                m.address.conversation.name = "group";
                                m.address.conversation.id = event.source.groupId;
                                m.address.conversation.isGroup = true;
                                m.address.channel.id = event.source.groupId;
                                m.address.user.name = "group";
                                m.address.user.id = event.source.groupId;
                                _this.conversationId = event.source.groupId;
                                _this.conversationType = "group";
                                break;
                            case 'room':
                                m.address.conversation.name = "room";
                                m.address.conversation.id = event.source.roomId;
                                m.address.conversation.isGroup = true;
                                m.address.channel.id = event.source.roomId;
                                m.address.user.name = "room";
                                m.address.user.id = event.source.roomId;
                                _this.conversationId = event.source.roomId;
                                _this.conversationType = "room";
                                break;
                        }
                        m.from = {
                            id: event.source.userId
                        };
                        if (!(event.source.userId && _this.autoGetUserProfile)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, _this.getUserProfile(event.source.userId)];
                    case 2:
                        r = _a.sent();
                        m.from = {
                            id: event.source.userId,
                            name: r.displayName,
                            pictureUrl: r.pictureUrl,
                            statusMessage: r.statusMessage
                        };
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        switch (event.type) {
                            case 'message':
                                m.id = event.message.id;
                                m.type = 'message';
                                message = event.message;
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
                                m.text = "follow";
                                break;
                            case 'unfollow':
                                m.id = event.source.userId;
                                m.type = 'conversationUpdate';
                                m.text = "unfollow";
                                break;
                            case 'join':
                                m.membersAdded = [{}];
                                m.type = 'conversationUpdate';
                                m.text = "join";
                                break;
                            case 'leave':
                                m.membersRemoved = true;
                                m.type = 'conversationUpdate';
                                m.text = "leave";
                                break;
                            case 'postback':
                                m.type = 'message';
                                data = event.postback.data;
                                if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                                    data = "" + event.postback.params.datetime;
                                }
                                m.text = data;
                                break;
                            case 'beacon':
                                break;
                            default:
                                throw new Error("Unknown event: " + JSON.stringify(event));
                                break;
                        }
                        // console.log("m", m)
                        _this.handler([m]);
                        return [2 /*return*/];
                }
            });
        }); });
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
        console.log("post", path, body);
        // console.log(path, body)
        // let r;
        // try {
        //     r = fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
        // } catch (er) {
        //     console.log("er",er)
        // }
        return fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
    };
    LineConnector.prototype.get = function (path) {
        // console.log("get", path);
        return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
    };
    LineConnector.prototype.reply = function (replyToken, message) {
        return __awaiter(this, void 0, void 0, function () {
            var m, body, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("reply");
                        m = LineConnector.createMessages(message);
                        body = {
                            replyToken: replyToken,
                            messages: m
                        };
                        return [4 /*yield*/, this.post('/message/reply', body).then()];
                    case 1:
                        r = _a.sent();
                        if (r.status === 400) {
                            r.json().then(function (json) { console.log(json); throw new Error(json.toString()); });
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.push = function (toId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var m, body, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        m = LineConnector.createMessages(message);
                        body = {
                            to: toId,
                            messages: m
                        };
                        return [4 /*yield*/, this.post('/message/push', body).then()];
                    case 1:
                        r = _a.sent();
                        // let r = await res.json().then();
                        if (r.status === 400) {
                            r.json().then(function (json) { console.log(json); throw new Error(json.toString()); });
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.getUserProfile = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = '/profile/' + userId;
                        return [4 /*yield*/, this.get(url).then()];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json().then()];
                    case 2:
                        r = _a.sent();
                        if (r.message) {
                            throw new Error(r.message);
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.getMemberIDs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.conversationType === undefined) {
                            throw new Error("not room or group");
                            return [2 /*return*/];
                        }
                        url = "/" + (this.conversationType === "group" ? "group" : this.conversationType === "room" ? "room" : "") + "/" + this.conversationId + "/members/ids";
                        return [4 /*yield*/, this.get(url).then()
                            // console.log(res)
                        ];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json().then()];
                    case 2:
                        r = _a.sent();
                        if (r.message) {
                            throw new Error(r.message);
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.getMemberRrofile = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.conversationType === undefined) {
                            throw new Error("not room or group");
                            return [2 /*return*/];
                        }
                        url = "/" + (this.conversationType === "group" ? "group" : this.conversationType === "room" ? "room" : "") + "/" + this.conversationId + "/member/" + userId;
                        return [4 /*yield*/, this.get(url).then()];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json().then()];
                    case 2:
                        r = _a.sent();
                        if (r.message) {
                            throw new Error(r.message);
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.leave = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, body, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.conversationType === undefined) {
                            throw new Error("not room or group");
                            return [2 /*return*/];
                        }
                        url = "/" + (this.conversationType === "group" ? "group" : this.conversationType === "room" ? "room" : "") + "/" + this.conversationId + "/leave";
                        body = {
                            replyToken: this.replyToken,
                        };
                        return [4 /*yield*/, this.post(url, body).then()];
                    case 1:
                        r = _a.sent();
                        // let r = await res.json().then();
                        if (r.status === 400) {
                            r.json().then(function (json) { console.log(json); throw new Error(json.toString()); });
                        }
                        return [2 /*return*/, r];
                }
            });
        });
    };
    LineConnector.prototype.getRenderTemplate = function (event) {
        var _this = this;
        // console.log("getRenderTemplate", event)
        //20170825 should be there
        var getButtonTemp = function (b) {
            if (b.type === 'postBack') {
                return {
                    "type": "postback",
                    "label": b.title,
                    "data": b.value,
                };
            }
            else if (b.type === 'openUrl') {
                return {
                    "type": "uri",
                    "label": b.title ? b.title : "open url",
                    "uri": b.value
                };
            }
            else if (b.type === 'datatimepicker') {
                // console.log("datatimepicker", b)
                var p = {
                    "type": "datetimepicker",
                    "label": b.title,
                    "data": "DATETIME",
                    "mode": "datetime",
                    "initial": new Date(new Date().getTime() - (1000 * 60 * new Date().getTimezoneOffset())).toISOString().substring(0, new Date().toISOString().length - 8),
                    "max": new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30 * 12)).toISOString().substring(0, new Date().toISOString().length - 8),
                    "min": new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 12)).toISOString().substring(0, new Date().toISOString().length - 8),
                };
                if (b.value) {
                    var d = JSON.parse(b.value);
                    p.initial = d.initial ? d.initial : p.initial;
                    p.max = d.max ? d.max : p.max;
                    p.min = d.min ? d.min : p.min;
                }
                return p;
            }
            else {
                return {
                    "type": "message",
                    "label": b.title,
                    "text": b.value
                };
            }
        };
        var getAltText = function (s) {
            return s.substring(0, 400);
        };
        // console.log("event", event)
        switch (event.type) {
            case 'message':
                if (event.text) {
                    if (event.suggestedActions && event.suggestedActions.actions && event.suggestedActions.actions.length > 0) {
                        var l = event.suggestedActions.actions.length;
                        switch (l) {
                            // case 2:
                            //     //confirm
                            //     return {
                            //         type: "template",
                            //         altText: getAltText(event.text),
                            //         template: {
                            //             type: "confirm",
                            //             // title: event.text || "",
                            //             text: `${event.text || ""}`,
                            //             actions: event.suggestedActions.actions.map(b =>
                            //                 getButtonTemp(b)
                            //             )
                            //         }
                            //     }
                            default:
                                return {
                                    type: "template",
                                    altText: getAltText(event.text),
                                    template: {
                                        type: "buttons",
                                        // title: event.text || "",
                                        text: "" + (event.text || ""),
                                        actions: event.suggestedActions.actions.map(function (b) {
                                            return getButtonTemp(b);
                                        })
                                    }
                                };
                        }
                    }
                    return {
                        type: 'text',
                        text: event.text
                    };
                }
                else if (event.attachments) {
                    if (event.attachmentLayout === 'carousel') {
                        //for carousel
                        //for image carousel
                        // let be_same = event.attachments.reduce((c, n) => {
                        //     return c.contentType === n.contentType
                        // })
                        var be_same = event.attachments.reduce(function (c, n) {
                            if (c.contentType === n.contentType) {
                                return c;
                            }
                            else {
                                return false;
                            }
                        });
                        if (!be_same) {
                            throw new Error("must be same attachment");
                        }
                        if (event.attachments[0].contentType === "application/vnd.microsoft.card.hero") {
                            // let be_image_carousel = event.attachments.reduce((c, n) => {
                            //     return c.content.images.length === 1 && n.content.images.length === 1 && c.content.buttons.length === 1 && n.content.buttons.length === 1
                            // })
                            var be_image_carousel = event.attachments.reduce(function (c, n) {
                                if (c === false) {
                                    return false;
                                }
                                if (c.content.images && c.content.images.length === 1 && n.content.images.length === 1 && c.content.buttons.length === 1 && n.content.buttons.length === 1) {
                                    return c;
                                }
                                else {
                                    return false;
                                }
                            });
                            if (be_image_carousel) {
                                return {
                                    "type": "template",
                                    "altText": getAltText(event.attachments[0].content.text),
                                    "template": {
                                        "type": "image_carousel",
                                        "columns": event.attachments.map(function (a) {
                                            return {
                                                imageUrl: a.content.images[0].url,
                                                action: getButtonTemp(a.content.buttons[0])
                                            };
                                        })
                                    }
                                };
                            }
                            else {
                                var t = {
                                    type: "template",
                                    altText: getAltText(event.attachments[0].content.text),
                                    template: {
                                        type: "carousel",
                                        imageAspectRatio: "rectangle",
                                        imageSize: "cover",
                                        columns: event.attachments.map(function (a) {
                                            var c = {
                                                title: a.content.title || "",
                                                text: getAltText(event.attachments[0].content.text),
                                                actions: a.content.buttons.map(function (b) {
                                                    return getButtonTemp(b);
                                                })
                                            };
                                            if (a.content.images) {
                                                c.thumbnailImageUrl = a.content.images[0].url;
                                                c.imageBackgroundColor = "#FFFFFF";
                                            }
                                            return c;
                                        })
                                    }
                                };
                                return t;
                            }
                        }
                        else {
                            throw new Error("do not suppoert this card,only support HeroCard ");
                        }
                    }
                    return event.attachments.map(function (a) {
                        // console.log("a", a)
                        switch (a.contentType) {
                            case 'sticker':
                                return { type: 'sticker', packageId: a.content.packageId, stickerId: a.content.stickerId };
                            case 'location':
                                return {
                                    type: 'location',
                                    title: a.content.title,
                                    address: a.content.address,
                                    latitude: a.content.latitude,
                                    longitude: a.content.longitude
                                };
                            case 'application/vnd.microsoft.card.video':
                                if (a.content.image && a.content.media && a.content.media[0].url.indexOf("https") > -1 && a.content.image.url.indexOf("https") > -1) {
                                    return {
                                        "type": "video",
                                        "originalContentUrl": a.content.media[0].url,
                                        "previewImageUrl": a.content.image.url
                                    };
                                }
                                else {
                                    return new Error("need image and media");
                                }
                            case 'application/vnd.microsoft.card.audio':
                                if (a.content.media && a.content.media[0].url.indexOf("https") > -1) {
                                    return {
                                        "type": "audio",
                                        "originalContentUrl": a.content.media[0].url,
                                        "duration": a.content.media[0].duration || 240000
                                    };
                                }
                                else {
                                    return new Error("need image and media");
                                }
                            case 'application/vnd.microsoft.keyboard':
                                if (a.content.image && a.content.image.url.indexOf("https") > -1) {
                                    return {
                                        "type": "image",
                                        "originalContentUrl": a.content.image.url,
                                        "previewImageUrl": a.content.image.url
                                    };
                                }
                            case 'application/vnd.microsoft.card.hero':
                                if (!a.content.buttons) {
                                    return new Error("need buttons data");
                                }
                                if (a.content.images === undefined && a.content.buttons.length === 2) {
                                    //confirm
                                    return {
                                        type: "template",
                                        altText: getAltText(a.content.text),
                                        template: {
                                            type: "confirm",
                                            title: a.content.title || "",
                                            text: "" + (a.content.title || "") + (a.content.subtitle || ""),
                                            actions: a.content.buttons.map(function (b) {
                                                return getButtonTemp(b);
                                            })
                                        }
                                    };
                                }
                                else {
                                    var t = {
                                        type: "template",
                                        altText: a.content.text,
                                        template: {
                                            type: "buttons",
                                            title: a.content.title || "",
                                            text: "" + (a.content.title || "") + (a.content.subtitle || ""),
                                            actions: a.content.buttons.map(function (b) {
                                                return getButtonTemp(b);
                                            })
                                        }
                                    };
                                    if (a.content.images) {
                                        t.template.thumbnailImageUrl = a.content.images[0].url;
                                        t.template.imageAspectRatio = "rectangle";
                                        t.template.imageSize = "cover";
                                        t.template.imageBackgroundColor = "#FFFFFF";
                                    }
                                    return t;
                                }
                        }
                    });
                }
        }
    };
    LineConnector.prototype.send = function (messages, done) {
        // let ts = [];
        var _this = this;
        messages.map(function (e, i) {
            // console.log("e", e)
            var address = e.address;
            if (e.type === 'endOfConversation') {
                return address;
            }
            if (_this.hasPushApi) {
                _this.conversationId = e.address.channelId;
                _this.push(_this.conversationId, _this.getRenderTemplate(e));
            }
            else if (_this.replyToken) {
                var t = _this.getRenderTemplate(e);
                // console.log(t)
                if (Array.isArray(t)) {
                    _this.event_cache = _this.event_cache.concat(t);
                }
                else {
                    _this.event_cache.push(t);
                }
                if ((_this.event_cache.length === messages.length) || _this.event_cache.length === 5) {
                    var r = (' ' + _this.replyToken).slice(1);
                    _this.replyToken = null;
                    _this.reply(r, _this.event_cache);
                    _this.event_cache = [];
                }
            }
            else {
                throw new Error("no way to send message: " + e);
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