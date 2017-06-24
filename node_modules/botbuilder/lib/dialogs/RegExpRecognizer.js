"use strict";
var RegExpRecognizer = (function () {
    function RegExpRecognizer(intent, expressions) {
        this.intent = intent;
        if (expressions instanceof RegExp) {
            this.expressions = { '*': expressions };
        }
        else {
            this.expressions = (expressions || {});
        }
    }
    RegExpRecognizer.prototype.recognize = function (context, cb) {
        var result = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            var utterance = context.message.text;
            var locale = context.locale || '*';
            var exp = this.expressions.hasOwnProperty(locale) ? this.expressions[locale] : this.expressions['*'];
            if (exp) {
                var matches = exp.exec(context.message.text);
                if (matches && matches.length) {
                    var matched = matches[0];
                    result.score = matched.length / context.message.text.length;
                    result.intent = this.intent;
                    result.expression = exp;
                    result.matched = matches;
                }
                cb(null, result);
            }
            else {
                cb(new Error("Expression not found for locale '" + locale + "'."), null);
            }
        }
        else {
            cb(null, result);
        }
    };
    return RegExpRecognizer;
}());
exports.RegExpRecognizer = RegExpRecognizer;
