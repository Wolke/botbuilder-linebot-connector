"use strict";
var request = require("request");
var LuisRecognizer = (function () {
    function LuisRecognizer(models) {
        if (typeof models == 'string') {
            this.models = { '*': models };
        }
        else {
            this.models = (models || {});
        }
    }
    LuisRecognizer.prototype.recognize = function (context, cb) {
        var result = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            var utterance = context.message.text;
            var locale = context.locale || '*';
            var model = this.models.hasOwnProperty(locale) ? this.models[locale] : this.models['*'];
            if (model) {
                LuisRecognizer.recognize(utterance, model, function (err, intents, entities) {
                    if (!err) {
                        result.intents = intents;
                        result.entities = entities;
                        var top;
                        intents.forEach(function (intent) {
                            if (top) {
                                if (intent.score > top.score) {
                                    top = intent;
                                }
                            }
                            else {
                                top = intent;
                            }
                        });
                        if (top) {
                            result.score = top.score;
                            result.intent = top.intent;
                            switch (top.intent.toLowerCase()) {
                                case 'builtin.intent.none':
                                case 'none':
                                    result.score = 0.1;
                                    break;
                            }
                        }
                        cb(null, result);
                    }
                    else {
                        cb(err, null);
                    }
                });
            }
            else {
                cb(new Error("LUIS model not found for locale '" + locale + "'."), null);
            }
        }
        else {
            cb(null, result);
        }
    };
    LuisRecognizer.recognize = function (utterance, modelUrl, callback) {
        try {
            var uri = modelUrl.trim();
            if (uri.lastIndexOf('&q=') != uri.length - 3) {
                uri += '&q=';
            }
            uri += encodeURIComponent(utterance || '');
            request.get(uri, function (err, res, body) {
                var result;
                try {
                    if (!err) {
                        result = JSON.parse(body);
                        result.intents = result.intents || [];
                        result.entities = result.entities || [];
                        if (result.topScoringIntent && result.intents.length == 0) {
                            result.intents.push(result.topScoringIntent);
                        }
                        if (result.intents.length == 1 && typeof result.intents[0].score !== 'number') {
                            result.intents[0].score = 1.0;
                        }
                    }
                }
                catch (e) {
                    err = e;
                }
                try {
                    if (!err) {
                        callback(null, result.intents, result.entities);
                    }
                    else {
                        var m = err.toString();
                        callback(err instanceof Error ? err : new Error(m));
                    }
                }
                catch (e) {
                    console.error(e.toString());
                }
            });
        }
        catch (err) {
            callback(err instanceof Error ? err : new Error(err.toString()));
        }
    };
    return LuisRecognizer;
}());
exports.LuisRecognizer = LuisRecognizer;
