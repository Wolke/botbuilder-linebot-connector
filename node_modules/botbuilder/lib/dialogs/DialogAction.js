"use strict";
var Session_1 = require("../Session");
var Dialog_1 = require("./Dialog");
var SimpleDialog_1 = require("./SimpleDialog");
var consts = require("../consts");
var utils = require("../utils");
var DialogAction = (function () {
    function DialogAction() {
    }
    DialogAction.send = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.splice(0, 0, msg);
        return function sendAction(s) {
            Session_1.Session.prototype.send.apply(s, args);
        };
    };
    DialogAction.beginDialog = function (id, args) {
        return function beginDialogAction(s, a) {
            if (a && a.hasOwnProperty('resumed')) {
                var r = a;
                if (r.error) {
                    s.error(r.error);
                }
            }
            else {
                if (args) {
                    a = a || {};
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            a[key] = args[key];
                        }
                    }
                }
                s.beginDialog(id, a);
            }
        };
    };
    DialogAction.endDialog = function (result) {
        return function endDialogAction(s) {
            s.endDialog(result);
        };
    };
    DialogAction.validatedPrompt = function (promptType, validator) {
        return new SimpleDialog_1.SimpleDialog(function (s, r) {
            r = r || {};
            var valid = false;
            if (r.response) {
                try {
                    valid = validator(r.response);
                }
                catch (e) {
                    s.error(e);
                }
            }
            var canceled = false;
            switch (r.resumed) {
                case Dialog_1.ResumeReason.canceled:
                case Dialog_1.ResumeReason.forward:
                case Dialog_1.ResumeReason.back:
                    canceled = true;
                    break;
            }
            if (valid || canceled) {
                s.endDialogWithResult(r);
            }
            else if (!s.dialogData.hasOwnProperty('prompt')) {
                s.dialogData = utils.clone(r);
                s.dialogData.promptType = promptType;
                if (!s.dialogData.hasOwnProperty('maxRetries')) {
                    s.dialogData.maxRetries = 2;
                }
                var a = utils.clone(s.dialogData);
                a.maxRetries = 0;
                s.beginDialog(consts.DialogId.Prompts, a);
            }
            else if (s.dialogData.maxRetries > 0) {
                s.dialogData.maxRetries--;
                var a = utils.clone(s.dialogData);
                a.maxRetries = 0;
                a.prompt = s.dialogData.retryPrompt || "I didn't understand. " + s.dialogData.prompt;
                s.beginDialog(consts.DialogId.Prompts, a);
            }
            else {
                s.endDialogWithResult({ resumed: Dialog_1.ResumeReason.notCompleted });
            }
        });
    };
    return DialogAction;
}());
exports.DialogAction = DialogAction;
