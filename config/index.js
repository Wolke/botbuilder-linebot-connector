var _ = require("lodash");
require('dotenv').config({ silent: true });
var defaults = require("./default.js");
var config = require("./" + (process.env.NODE_ENV || "development") + ".js");
module.exports = _.merge({}, defaults, config);
