"use strict";
var OpenIdMetadata_1 = require("./OpenIdMetadata");
var utils = require("../utils");
var logger = require("../logger");
var consts = require("../consts");
var request = require("request");
var async = require("async");
var jwt = require("jsonwebtoken");
var zlib = require("zlib");
var urlJoin = require("url-join");
var pjson = require('../../package.json');
var MAX_DATA_LENGTH = 65000;
var USER_AGENT = "Microsoft-BotFramework/3.1 (BotBuilder Node.js/" + pjson.version + ")";
var ChatConnector = (function () {
    function ChatConnector(settings) {
        if (settings === void 0) { settings = {}; }
        this.settings = settings;
        if (!this.settings.endpoint) {
            this.settings.endpoint = {
                refreshEndpoint: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
                refreshScope: 'https://api.botframework.com/.default',
                botConnectorOpenIdMetadata: this.settings.openIdMetadata || 'https://login.botframework.com/v1/.well-known/openidconfiguration',
                botConnectorIssuer: 'https://api.botframework.com',
                botConnectorAudience: this.settings.appId,
                msaOpenIdMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
                msaIssuer: 'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/',
                msaAudience: 'https://graph.microsoft.com',
                emulatorOpenIdMetadata: 'https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration',
                emulatorAudience: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
                emulatorIssuer: this.settings.appId,
                stateEndpoint: this.settings.stateEndpoint || 'https://state.botframework.com'
            };
        }
        this.botConnectorOpenIdMetadata = new OpenIdMetadata_1.OpenIdMetadata(this.settings.endpoint.botConnectorOpenIdMetadata);
        this.msaOpenIdMetadata = new OpenIdMetadata_1.OpenIdMetadata(this.settings.endpoint.msaOpenIdMetadata);
        this.emulatorOpenIdMetadata = new OpenIdMetadata_1.OpenIdMetadata(this.settings.endpoint.emulatorOpenIdMetadata);
    }
    ChatConnector.prototype.listen = function () {
        var _this = this;
        return function (req, res) {
            if (req.body) {
                _this.verifyBotFramework(req, res);
            }
            else {
                var requestData = '';
                req.on('data', function (chunk) {
                    requestData += chunk;
                });
                req.on('end', function () {
                    req.body = JSON.parse(requestData);
                    _this.verifyBotFramework(req, res);
                });
            }
        };
    };
    ChatConnector.prototype.verifyBotFramework = function (req, res) {
        var _this = this;
        var token;
        var isEmulator = req.body['channelId'] === 'emulator';
        var authHeaderValue = req.headers ? req.headers['authorization'] || req.headers['Authorization'] : null;
        if (authHeaderValue) {
            var auth = authHeaderValue.trim().split(' ');
            if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                token = auth[1];
            }
        }
        if (token) {
            req.body['useAuth'] = true;
            var decoded = jwt.decode(token, { complete: true });
            var verifyOptions;
            var openIdMetadata;
            if (isEmulator && decoded.payload.iss == this.settings.endpoint.msaIssuer) {
                openIdMetadata = this.msaOpenIdMetadata;
                verifyOptions = {
                    issuer: this.settings.endpoint.msaIssuer,
                    audience: this.settings.endpoint.msaAudience,
                    clockTolerance: 300
                };
            }
            else if (isEmulator && decoded.payload.iss == this.settings.endpoint.emulatorIssuer) {
                openIdMetadata = this.emulatorOpenIdMetadata;
                verifyOptions = {
                    issuer: this.settings.endpoint.emulatorIssuer,
                    audience: this.settings.endpoint.emulatorAudience,
                    clockTolerance: 300
                };
            }
            else {
                openIdMetadata = this.botConnectorOpenIdMetadata;
                verifyOptions = {
                    issuer: this.settings.endpoint.botConnectorIssuer,
                    audience: this.settings.endpoint.botConnectorAudience,
                    clockTolerance: 300
                };
            }
            if (isEmulator && decoded.payload.appid != this.settings.appId) {
                logger.error('ChatConnector: receive - invalid token. Requested by unexpected app ID.');
                res.status(403);
                res.end();
                return;
            }
            openIdMetadata.getKey(decoded.header.kid, function (key) {
                if (key) {
                    try {
                        jwt.verify(token, key, verifyOptions);
                    }
                    catch (err) {
                        logger.error('ChatConnector: receive - invalid token. Check bot\'s app ID & Password.');
                        res.status(403);
                        res.end();
                        return;
                    }
                    _this.dispatch(req.body, res);
                }
                else {
                    logger.error('ChatConnector: receive - invalid signing key or OpenId metadata document.');
                    res.status(500);
                    res.end();
                    return;
                }
            });
        }
        else if (isEmulator && !this.settings.appId && !this.settings.appPassword) {
            logger.warn(req.body, 'ChatConnector: receive - emulator running without security enabled.');
            req.body['useAuth'] = false;
            this.dispatch(req.body, res);
        }
        else {
            logger.error('ChatConnector: receive - no security token sent.');
            res.status(401);
            res.end();
        }
    };
    ChatConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };
    ChatConnector.prototype.send = function (messages, done) {
        var _this = this;
        async.eachSeries(messages, function (msg, cb) {
            try {
                if (msg.address && msg.address.serviceUrl) {
                    _this.postMessage(msg, cb);
                }
                else {
                    logger.error('ChatConnector: send - message is missing address or serviceUrl.');
                    cb(new Error('Message missing address or serviceUrl.'));
                }
            }
            catch (e) {
                cb(e);
            }
        }, done);
    };
    ChatConnector.prototype.startConversation = function (address, done) {
        if (address && address.user && address.bot && address.serviceUrl) {
            var options = {
                method: 'POST',
                url: urlJoin(address.serviceUrl, '/v3/conversations'),
                body: {
                    bot: address.bot,
                    members: [address.user]
                },
                json: true
            };
            this.authenticatedRequest(options, function (err, response, body) {
                var adr;
                if (!err) {
                    try {
                        var obj = typeof body === 'string' ? JSON.parse(body) : body;
                        if (obj && obj.hasOwnProperty('id')) {
                            adr = utils.clone(address);
                            adr.conversation = { id: obj['id'] };
                            if (adr.id) {
                                delete adr.id;
                            }
                        }
                        else {
                            err = new Error('Failed to start conversation: no conversation ID returned.');
                        }
                    }
                    catch (e) {
                        err = e instanceof Error ? e : new Error(e.toString());
                    }
                }
                if (err) {
                    logger.error('ChatConnector: startConversation - error starting conversation.');
                }
                done(err, adr);
            });
        }
        else {
            logger.error('ChatConnector: startConversation - address is invalid.');
            done(new Error('Invalid address.'));
        }
    };
    ChatConnector.prototype.getData = function (context, callback) {
        var _this = this;
        try {
            var root = this.getStoragePath(context.address);
            var list = [];
            if (context.userId) {
                if (context.persistUserData) {
                    list.push({
                        field: 'userData',
                        url: root + '/users/' + encodeURIComponent(context.userId)
                    });
                }
                if (context.conversationId) {
                    list.push({
                        field: 'privateConversationData',
                        url: root + '/conversations/' + encodeURIComponent(context.conversationId) +
                            '/users/' + encodeURIComponent(context.userId)
                    });
                }
            }
            if (context.persistConversationData && context.conversationId) {
                list.push({
                    field: 'conversationData',
                    url: root + '/conversations/' + encodeURIComponent(context.conversationId)
                });
            }
            var data = {};
            async.each(list, function (entry, cb) {
                var options = {
                    method: 'GET',
                    url: entry.url,
                    json: true
                };
                _this.authenticatedRequest(options, function (err, response, body) {
                    if (!err && body) {
                        var botData = body.data ? body.data : {};
                        if (typeof botData === 'string') {
                            zlib.gunzip(new Buffer(botData, 'base64'), function (err, result) {
                                if (!err) {
                                    try {
                                        var txt = result.toString();
                                        data[entry.field + 'Hash'] = txt;
                                        data[entry.field] = JSON.parse(txt);
                                    }
                                    catch (e) {
                                        err = e;
                                    }
                                }
                                cb(err);
                            });
                        }
                        else {
                            try {
                                data[entry.field + 'Hash'] = JSON.stringify(botData);
                                data[entry.field] = botData;
                            }
                            catch (e) {
                                err = e;
                            }
                            cb(err);
                        }
                    }
                    else {
                        cb(err);
                    }
                });
            }, function (err) {
                if (!err) {
                    callback(null, data);
                }
                else {
                    var m = err.toString();
                    callback(err instanceof Error ? err : new Error(m), null);
                }
            });
        }
        catch (e) {
            callback(e instanceof Error ? e : new Error(e.toString()), null);
        }
    };
    ChatConnector.prototype.saveData = function (context, data, callback) {
        var _this = this;
        var list = [];
        function addWrite(field, botData, url) {
            var hashKey = field + 'Hash';
            var hash = JSON.stringify(botData);
            if (!data[hashKey] || hash !== data[hashKey]) {
                data[hashKey] = hash;
                list.push({ botData: botData, url: url, hash: hash });
            }
        }
        try {
            var root = this.getStoragePath(context.address);
            if (context.userId) {
                if (context.persistUserData) {
                    addWrite('userData', data.userData || {}, root + '/users/' + encodeURIComponent(context.userId));
                }
                if (context.conversationId) {
                    var url = root + '/conversations/' + encodeURIComponent(context.conversationId) +
                        '/users/' + encodeURIComponent(context.userId);
                    addWrite('privateConversationData', data.privateConversationData || {}, url);
                }
            }
            if (context.persistConversationData && context.conversationId) {
                addWrite('conversationData', data.conversationData || {}, root + '/conversations/' + encodeURIComponent(context.conversationId));
            }
            async.each(list, function (entry, cb) {
                if (_this.settings.gzipData) {
                    zlib.gzip(entry.hash, function (err, result) {
                        if (!err && result.length > MAX_DATA_LENGTH) {
                            err = new Error("Data of " + result.length + " bytes gzipped exceeds the " + MAX_DATA_LENGTH + " byte limit. Can't post to: " + entry.url);
                            err.code = consts.Errors.EMSGSIZE;
                        }
                        if (!err) {
                            var options = {
                                method: 'POST',
                                url: entry.url,
                                body: { eTag: '*', data: result.toString('base64') },
                                json: true
                            };
                            _this.authenticatedRequest(options, function (err, response, body) {
                                cb(err);
                            });
                        }
                        else {
                            cb(err);
                        }
                    });
                }
                else if (entry.hash.length < MAX_DATA_LENGTH) {
                    var options = {
                        method: 'POST',
                        url: entry.url,
                        body: { eTag: '*', data: entry.botData },
                        json: true
                    };
                    _this.authenticatedRequest(options, function (err, response, body) {
                        cb(err);
                    });
                }
                else {
                    var err = new Error("Data of " + entry.hash.length + " bytes exceeds the " + MAX_DATA_LENGTH + " byte limit. Consider setting connectors gzipData option. Can't post to: " + entry.url);
                    err.code = consts.Errors.EMSGSIZE;
                    cb(err);
                }
            }, function (err) {
                if (callback) {
                    if (!err) {
                        callback(null);
                    }
                    else {
                        var m = err.toString();
                        callback(err instanceof Error ? err : new Error(m));
                    }
                }
            });
        }
        catch (e) {
            if (callback) {
                var err = e instanceof Error ? e : new Error(e.toString());
                err.code = consts.Errors.EBADMSG;
                callback(err);
            }
        }
    };
    ChatConnector.prototype.dispatch = function (messages, res) {
        var _this = this;
        var list = Array.isArray(messages) ? messages : [messages];
        list.forEach(function (msg) {
            try {
                _this.prepIncomingMessage(msg);
                logger.info(msg, 'ChatConnector: message received.');
                _this.handler([msg]);
            }
            catch (e) {
                console.error(e instanceof Error ? e.stack : e.toString());
            }
        });
        res.status(202);
        res.end();
    };
    ChatConnector.prototype.postMessage = function (msg, cb) {
        logger.info(address, 'ChatConnector: sending message.');
        this.prepOutgoingMessage(msg);
        var address = msg.address;
        msg['from'] = address.bot;
        msg['recipient'] = address.user;
        delete msg.address;
        var path = '/v3/conversations/' + encodeURIComponent(address.conversation.id) + '/activities';
        if (address.id && address.channelId !== 'skype') {
            path += '/' + encodeURIComponent(address.id);
        }
        var options = {
            method: 'POST',
            url: urlJoin(address.serviceUrl, path),
            body: msg,
            json: true
        };
        if (address.useAuth) {
            this.authenticatedRequest(options, function (err, response, body) { return cb(err); });
        }
        else {
            this.addUserAgent(options);
            request(options, function (err, response, body) {
                if (!err && response.statusCode >= 400) {
                    var txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
                    err = new Error(txt);
                }
                cb(err);
            });
        }
    };
    ChatConnector.prototype.authenticatedRequest = function (options, callback, refresh) {
        var _this = this;
        if (refresh === void 0) { refresh = false; }
        if (refresh) {
            this.accessToken = null;
        }
        this.addAccessToken(options, function (err) {
            if (!err) {
                request(options, function (err, response, body) {
                    if (!err) {
                        switch (response.statusCode) {
                            case 401:
                            case 403:
                                if (!refresh) {
                                    _this.authenticatedRequest(options, callback, true);
                                }
                                else {
                                    callback(null, response, body);
                                }
                                break;
                            default:
                                if (response.statusCode < 400) {
                                    callback(null, response, body);
                                }
                                else {
                                    var txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
                                    callback(new Error(txt), response, null);
                                }
                                break;
                        }
                    }
                    else {
                        callback(err, null, null);
                    }
                });
            }
            else {
                callback(err, null, null);
            }
        });
    };
    ChatConnector.prototype.getAccessToken = function (cb) {
        var _this = this;
        if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
            var opt = {
                method: 'POST',
                url: this.settings.endpoint.refreshEndpoint,
                form: {
                    grant_type: 'client_credentials',
                    client_id: this.settings.appId,
                    client_secret: this.settings.appPassword,
                    scope: this.settings.endpoint.refreshScope
                }
            };
            request(opt, function (err, response, body) {
                if (!err) {
                    if (body && response.statusCode < 300) {
                        var oauthResponse = JSON.parse(body);
                        _this.accessToken = oauthResponse.access_token;
                        _this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
                        cb(null, _this.accessToken);
                    }
                    else {
                        cb(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                }
                else {
                    cb(err, null);
                }
            });
        }
        else {
            cb(null, this.accessToken);
        }
    };
    ChatConnector.prototype.addUserAgent = function (options) {
        if (options.headers == null) {
            options.headers = {};
        }
        options.headers['User-Agent'] = USER_AGENT;
    };
    ChatConnector.prototype.addAccessToken = function (options, cb) {
        this.addUserAgent(options);
        if (this.settings.appId && this.settings.appPassword) {
            this.getAccessToken(function (err, token) {
                if (!err && token) {
                    options.headers = {
                        'Authorization': 'Bearer ' + token
                    };
                    cb(null);
                }
                else {
                    cb(err);
                }
            });
        }
        else {
            cb(null);
        }
    };
    ChatConnector.prototype.getStoragePath = function (address) {
        var path;
        switch (address.channelId) {
            case 'emulator':
                if (address.serviceUrl) {
                    path = address.serviceUrl;
                }
                else {
                    throw new Error('ChatConnector.getStoragePath() missing address.serviceUrl.');
                }
                break;
            default:
                path = this.settings.endpoint.stateEndpoint;
                break;
        }
        return path + '/v3/botstate/' + encodeURIComponent(address.channelId);
    };
    ChatConnector.prototype.prepIncomingMessage = function (msg) {
        utils.moveFieldsTo(msg, msg, {
            'locale': 'textLocale',
            'channelData': 'sourceEvent'
        });
        msg.text = msg.text || '';
        msg.attachments = msg.attachments || [];
        msg.entities = msg.entities || [];
        var address = {};
        utils.moveFieldsTo(msg, address, toAddress);
        msg.address = address;
        msg.source = address.channelId;
        if (msg.source == 'facebook' && msg.sourceEvent && msg.sourceEvent.message && msg.sourceEvent.message.quick_reply) {
            msg.text = msg.sourceEvent.message.quick_reply.payload;
        }
    };
    ChatConnector.prototype.prepOutgoingMessage = function (msg) {
        if (msg.attachments) {
            var attachments = [];
            for (var i = 0; i < msg.attachments.length; i++) {
                var a = msg.attachments[i];
                switch (a.contentType) {
                    case 'application/vnd.microsoft.keyboard':
                        if (msg.address.channelId == 'facebook') {
                            msg.sourceEvent = { quick_replies: [] };
                            a.content.buttons.forEach(function (action) {
                                switch (action.type) {
                                    case 'imBack':
                                    case 'postBack':
                                        msg.sourceEvent.quick_replies.push({
                                            content_type: 'text',
                                            title: action.title,
                                            payload: action.value
                                        });
                                        break;
                                    default:
                                        logger.warn(msg, "Invalid keyboard '%s' button sent to facebook.", action.type);
                                        break;
                                }
                            });
                        }
                        else {
                            a.contentType = 'application/vnd.microsoft.card.hero';
                            attachments.push(a);
                        }
                        break;
                    default:
                        attachments.push(a);
                        break;
                }
            }
            msg.attachments = attachments;
        }
        utils.moveFieldsTo(msg, msg, {
            'textLocale': 'locale',
            'sourceEvent': 'channelData'
        });
        delete msg.agent;
        delete msg.source;
    };
    return ChatConnector;
}());
exports.ChatConnector = ChatConnector;
var toAddress = {
    'id': 'id',
    'channelId': 'channelId',
    'from': 'user',
    'conversation': 'conversation',
    'recipient': 'bot',
    'serviceUrl': 'serviceUrl',
    'useAuth': 'useAuth'
};
