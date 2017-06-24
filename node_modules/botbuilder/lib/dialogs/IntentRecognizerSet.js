"use strict";
var utils = require("../utils");
var async = require("async");
var RecognizeOrder;
(function (RecognizeOrder) {
    RecognizeOrder[RecognizeOrder["parallel"] = 0] = "parallel";
    RecognizeOrder[RecognizeOrder["series"] = 1] = "series";
})(RecognizeOrder = exports.RecognizeOrder || (exports.RecognizeOrder = {}));
var IntentRecognizerSet = (function () {
    function IntentRecognizerSet(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        if (typeof this.options.intentThreshold !== 'number') {
            this.options.intentThreshold = 0.1;
        }
        if (!this.options.hasOwnProperty('recognizeOrder')) {
            this.options.recognizeOrder = RecognizeOrder.parallel;
        }
        if (!this.options.recognizers) {
            this.options.recognizers = [];
        }
        if (!this.options.processLimit) {
            this.options.processLimit = 4;
        }
        if (!this.options.hasOwnProperty('stopIfExactMatch')) {
            this.options.stopIfExactMatch = true;
        }
        this.length = this.options.recognizers.length;
    }
    IntentRecognizerSet.prototype.clone = function (copyTo) {
        var obj = copyTo || new IntentRecognizerSet(utils.clone(this.options));
        obj.options.recognizers = this.options.recognizers.slice(0);
        return obj;
    };
    IntentRecognizerSet.prototype.recognize = function (context, done) {
        if (this.options.recognizeOrder == RecognizeOrder.parallel) {
            this.recognizeInParallel(context, done);
        }
        else {
            this.recognizeInSeries(context, done);
        }
    };
    IntentRecognizerSet.prototype.recognizer = function (plugin) {
        this.options.recognizers.push(plugin);
        this.length++;
        return this;
    };
    IntentRecognizerSet.prototype.recognizeInParallel = function (context, done) {
        var _this = this;
        var result = { score: 0.0, intent: null };
        async.eachLimit(this.options.recognizers, this.options.processLimit, function (recognizer, cb) {
            try {
                recognizer.recognize(context, function (err, r) {
                    if (!err && r && r.score > result.score && r.score >= _this.options.intentThreshold) {
                        result = r;
                    }
                    cb(err);
                });
            }
            catch (e) {
                cb(e);
            }
        }, function (err) {
            if (!err) {
                done(null, result);
            }
            else {
                var msg = err.toString();
                done(err instanceof Error ? err : new Error(msg), null);
            }
        });
    };
    IntentRecognizerSet.prototype.recognizeInSeries = function (context, done) {
        var _this = this;
        var i = 0;
        var result = { score: 0.0, intent: null };
        async.whilst(function () {
            return (i < _this.options.recognizers.length && (result.score < 1.0 || !_this.options.stopIfExactMatch));
        }, function (cb) {
            try {
                var recognizer = _this.options.recognizers[i++];
                recognizer.recognize(context, function (err, r) {
                    if (!err && r && r.score > result.score && r.score >= _this.options.intentThreshold) {
                        result = r;
                    }
                    cb(err);
                });
            }
            catch (e) {
                cb(e);
            }
        }, function (err) {
            if (!err) {
                done(null, result);
            }
            else {
                done(err instanceof Error ? err : new Error(err.toString()), null);
            }
        });
    };
    return IntentRecognizerSet;
}());
exports.IntentRecognizerSet = IntentRecognizerSet;
