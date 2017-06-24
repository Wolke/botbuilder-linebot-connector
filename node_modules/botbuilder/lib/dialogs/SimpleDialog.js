"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Dialog_1 = require("./Dialog");
var consts = require("../consts");
var logger = require("../logger");
var SimpleDialog = (function (_super) {
    __extends(SimpleDialog, _super);
    function SimpleDialog(fn) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        return _this;
    }
    SimpleDialog.prototype.begin = function (session, args) {
        this.fn(session, args);
    };
    SimpleDialog.prototype.replyReceived = function (session) {
        this.fn(session);
    };
    SimpleDialog.prototype.dialogResumed = function (session, result) {
        this.fn(session, result);
    };
    return SimpleDialog;
}(Dialog_1.Dialog));
exports.SimpleDialog = SimpleDialog;
function createWaterfall(steps) {
    return function waterfallAction(s, r) {
        var skip = function (result) {
            result = result || {};
            if (result.resumed == null) {
                result.resumed = Dialog_1.ResumeReason.forward;
            }
            waterfallAction(s, result);
        };
        if (r && r.hasOwnProperty('resumed')) {
            if (r.resumed !== Dialog_1.ResumeReason.reprompt) {
                var step = s.dialogData[consts.Data.WaterfallStep];
                switch (r.resumed) {
                    case Dialog_1.ResumeReason.back:
                        step -= 1;
                        break;
                    default:
                        step++;
                }
                if (step >= 0 && step < steps.length) {
                    try {
                        logger.info(s, 'waterfall() step %d of %d', step + 1, steps.length);
                        s.dialogData[consts.Data.WaterfallStep] = step;
                        steps[step](s, r, skip);
                    }
                    catch (e) {
                        s.error(e);
                    }
                }
                else {
                    s.endDialogWithResult(r);
                }
            }
        }
        else if (steps && steps.length > 0) {
            try {
                logger.info(s, 'waterfall() step %d of %d', 1, steps.length);
                s.dialogData[consts.Data.WaterfallStep] = 0;
                steps[0](s, r, skip);
            }
            catch (e) {
                s.error(e);
            }
        }
        else {
            logger.warn(s, 'waterfall() empty waterfall detected');
            s.endDialogWithResult({ resumed: Dialog_1.ResumeReason.notCompleted });
        }
    };
}
exports.createWaterfall = createWaterfall;
