"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ThumbnailCard_1 = require("./ThumbnailCard");
var HeroCard = (function (_super) {
    __extends(HeroCard, _super);
    function HeroCard(session) {
        var _this = _super.call(this, session) || this;
        _this.data.contentType = 'application/vnd.microsoft.card.hero';
        return _this;
    }
    return HeroCard;
}(ThumbnailCard_1.ThumbnailCard));
exports.HeroCard = HeroCard;
