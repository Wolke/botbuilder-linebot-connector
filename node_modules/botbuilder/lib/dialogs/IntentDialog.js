"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SimpleDialog_1 = require("./SimpleDialog");
var DialogAction_1 = require("./DialogAction");
var Dialog_1 = require("./Dialog");
var IntentRecognizerSet_1 = require("./IntentRecognizerSet");
var RegExpRecognizer_1 = require("./RegExpRecognizer");
var consts = require("../consts");
var logger = require("../logger");
var RecognizeMode;
(function (RecognizeMode) {
    RecognizeMode[RecognizeMode["onBegin"] = 0] = "onBegin";
    RecognizeMode[RecognizeMode["onBeginIfRoot"] = 1] = "onBeginIfRoot";
    RecognizeMode[RecognizeMode["onReply"] = 2] = "onReply";
})(RecognizeMode = exports.RecognizeMode || (exports.RecognizeMode = {}));
var IntentDialog = (function (_super) {
    __extends(IntentDialog, _super);
    function IntentDialog(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.handlers = {};
        _this.recognizers = new IntentRecognizerSet_1.IntentRecognizerSet(options);
        if (typeof options.recognizeMode !== "undefined") {
            _this.recognizeMode = options.recognizeMode;
        }
        else {
            _this.recognizeMode = RecognizeMode.onBeginIfRoot;
        }
        return _this;
    }
    IntentDialog.prototype.begin = function (session, args) {
        var _this = this;
        var mode = this.recognizeMode;
        var isRoot = (session.sessionState.callstack.length == 1);
        var recognize = (mode == RecognizeMode.onBegin || (isRoot && mode == RecognizeMode.onBeginIfRoot));
        if (this.beginDialog) {
            try {
                logger.info(session, 'IntentDialog.begin()');
                this.beginDialog(session, args, function () {
                    if (recognize) {
                        _this.replyReceived(session);
                    }
                });
            }
            catch (e) {
                this.emitError(session, e);
            }
        }
        else if (recognize) {
            this.replyReceived(session);
        }
    };
    IntentDialog.prototype.replyReceived = function (session, recognizeResult) {
        var _this = this;
        if (!recognizeResult) {
            var locale = session.preferredLocale();
            var context = session.toRecognizeContext();
            context.dialogData = session.dialogData;
            context.activeDialog = true;
            this.recognize(context, function (err, result) {
                if (!err) {
                    _this.invokeIntent(session, result);
                }
                else {
                    _this.emitError(session, err);
                }
            });
        }
        else {
            this.invokeIntent(session, recognizeResult);
        }
    };
    IntentDialog.prototype.dialogResumed = function (session, result) {
        var activeIntent = session.dialogData[consts.Data.Intent];
        if (activeIntent && this.handlers.hasOwnProperty(activeIntent)) {
            try {
                this.handlers[activeIntent](session, result);
            }
            catch (e) {
                this.emitError(session, e);
            }
        }
        else {
            _super.prototype.dialogResumed.call(this, session, result);
        }
    };
    IntentDialog.prototype.recognize = function (context, cb) {
        this.recognizers.recognize(context, cb);
    };
    IntentDialog.prototype.onBegin = function (handler) {
        this.beginDialog = handler;
        return this;
    };
    IntentDialog.prototype.matches = function (intent, dialogId, dialogArgs) {
        var id;
        if (intent) {
            if (typeof intent === 'string') {
                id = intent;
            }
            else {
                id = intent.toString();
                this.recognizers.recognizer(new RegExpRecognizer_1.RegExpRecognizer(id, intent));
            }
        }
        if (this.handlers.hasOwnProperty(id)) {
            throw new Error("A handler for '" + id + "' already exists.");
        }
        if (Array.isArray(dialogId)) {
            this.handlers[id] = SimpleDialog_1.createWaterfall(dialogId);
        }
        else if (typeof dialogId === 'string') {
            this.handlers[id] = DialogAction_1.DialogAction.beginDialog(dialogId, dialogArgs);
        }
        else {
            this.handlers[id] = SimpleDialog_1.createWaterfall([dialogId]);
        }
        return this;
    };
    IntentDialog.prototype.matchesAny = function (intents, dialogId, dialogArgs) {
        for (var i = 0; i < intents.length; i++) {
            this.matches(intents[i], dialogId, dialogArgs);
        }
        return this;
    };
    IntentDialog.prototype.onDefault = function (dialogId, dialogArgs) {
        if (Array.isArray(dialogId)) {
            this.handlers[consts.Intents.Default] = SimpleDialog_1.createWaterfall(dialogId);
        }
        else if (typeof dialogId === 'string') {
            this.handlers[consts.Intents.Default] = DialogAction_1.DialogAction.beginDialog(dialogId, dialogArgs);
        }
        else {
            this.handlers[consts.Intents.Default] = SimpleDialog_1.createWaterfall([dialogId]);
        }
        return this;
    };
    IntentDialog.prototype.recognizer = function (plugin) {
        this.recognizers.recognizer(plugin);
        return this;
    };
    IntentDialog.prototype.invokeIntent = function (session, recognizeResult) {
        var activeIntent;
        if (recognizeResult.intent && this.handlers.hasOwnProperty(recognizeResult.intent)) {
            logger.info(session, 'IntentDialog.matches(%s)', recognizeResult.intent);
            activeIntent = recognizeResult.intent;
        }
        else if (this.handlers.hasOwnProperty(consts.Intents.Default)) {
            logger.info(session, 'IntentDialog.onDefault()');
            activeIntent = consts.Intents.Default;
        }
        if (activeIntent) {
            try {
                session.dialogData[consts.Data.Intent] = activeIntent;
                this.handlers[activeIntent](session, recognizeResult);
            }
            catch (e) {
                this.emitError(session, e);
            }
        }
        else {
            logger.warn(session, 'IntentDialog - no intent handler found for %s', recognizeResult.intent);
        }
    };
    IntentDialog.prototype.emitError = function (session, err) {
        var m = err.toString();
        err = err instanceof Error ? err : new Error(m);
        session.error(err);
    };
    return IntentDialog;
}(Dialog_1.Dialog));
exports.IntentDialog = IntentDialog;
