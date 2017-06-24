"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MediaCard_1 = require("./MediaCard");
var AnimationCard = (function (_super) {
    __extends(AnimationCard, _super);
    function AnimationCard(session) {
        var _this = _super.call(this, session) || this;
        _this.data.contentType = 'application/vnd.microsoft.card.animation';
        return _this;
    }
    return AnimationCard;
}(MediaCard_1.MediaCard));
exports.AnimationCard = AnimationCard;
