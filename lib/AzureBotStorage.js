"use strict";
var async = require('async');
var Promise = require('promise');
var Consts = require('./Consts');
var zlib = require('zlib');
var azure = require('azure-storage');
var iStorageobj = require('./IStorageClient');
var mongoDbConnection = require('./connection.js');

var docDbClient = new iStorageobj.IStorageClient();

var AzureBotStorage = (function () {
    function AzureBotStorage(options, storageClient) {
        this.options = options;
        this.storageClient = storageClient;
    }
    AzureBotStorage.prototype.client = function (storageClient) {
        this.storageClient = storageClient;
        return this;
    };
    AzureBotStorage.prototype.getData = function (context, callback) {
        var _this = this;
        this.initializeStorageClient().done(function () {
            var list = [];
            if (context.userId) {
                if (context.persistUserData) {
                    list.push({
                        partitionKey: context.userId,
                        rowKey: Consts.Fields.UserDataField,
                        field: Consts.Fields.UserDataField
                    });
                }
                if (context.conversationId) {
                    list.push({
                        partitionKey: context.conversationId,
                        rowKey: context.userId,
                        field: Consts.Fields.PrivateConversationDataField
                    });
                }
            }
            if (context.persistConversationData && context.conversationId) {
                list.push({
                    partitionKey: context.conversationId,
                    rowKey: Consts.Fields.ConversationDataField,
                    field: Consts.Fields.ConversationDataField
                });
            }
            var data = {};
            async.each(list, function (entry, cb) {
                docDbClient.retrieve(entry.partitionKey, entry.rowKey, function (error, entity, response) {
                    if (!error) {
                        if (entity) {
                            var botData = entity.data || {};
                            var isCompressed = entity.isCompressed || false;
                            if (isCompressed) {
                                zlib.gunzip(new Buffer(botData, Consts.base64), function (err, result) {
                                    if (!err) {
                                        try {
                                            var txt = result.toString();
                                            data[entry.field + Consts.hash] = txt;
                                            data[entry.field] = txt != null ? JSON.parse(txt) : null;
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
                                    data[entry.field + Consts.hash] = botData ? JSON.stringify(botData) : null;
                                    data[entry.field] = botData != null ? botData : null;
                                }
                                catch (e) {
                                    error = e;
                                }
                                cb(error);
                            }
                        }
                        else {
                            data[entry.field + Consts.hash] = null;
                            data[entry.field] = null;
                            cb(error);
                        }
                    }
                    else {
                        cb(error);
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
        }, function (err) { return callback(err, null); });
    };
    AzureBotStorage.prototype.saveData = function (context, data, callback) {
        var _this = this;
        var promise = this.initializeStorageClient();
        promise.done(function () {
            var list = [];
            function addWrite(field, partitionKey, rowKey, botData) {
                var hashKey = field + Consts.hash;
                var hash = JSON.stringify(botData);
                if (!data[hashKey] || hash !== data[hashKey]) {
                    data[hashKey] = hash;
                    list.push({ field: field, partitionKey: partitionKey, rowKey: rowKey, botData: botData, hash: hash });
                }
            }
            try {
                if (context.userId) {
                    if (context.persistUserData) {
                        addWrite(Consts.Fields.UserDataField, context.userId, Consts.Fields.UserDataField, data.userData);
                    }
                    if (context.conversationId) {
                        addWrite(Consts.Fields.PrivateConversationDataField, context.conversationId, context.userId, data.privateConversationData);
                    }
                }
                if (context.persistConversationData && context.conversationId) {
                    addWrite(Consts.Fields.ConversationDataField, context.conversationId, Consts.Fields.ConversationDataField, data.conversationData);
                }
                async.each(list, function (entry, errorCallback) {
                    if (_this.options.gzipData) {
                        zlib.gzip(entry.hash, function (err, result) {
                            if (!err && result.length > Consts.maxDataLength) {
                                err = new Error("Data of " + result.length + " bytes gzipped exceeds the " + Consts.maxDataLength + " byte limit. Can't post to: " + entry.url);
                                err.code = Consts.ErrorCodes.MessageSize;
                            }
                            if (!err) {
                                _this.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, result.toString('base64'), true, function (error, eTag, response) {
                                    errorCallback(error);
                                });
                            }
                            else {
                                errorCallback(err);
                            }
                        });
                    }
                    else if (entry.hash.length < Consts.maxDataLength) {
                        _this.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, entry.botData, false, function (error, eTag, response) {
                            errorCallback(error);
                        });
                    }
                    else {
                        var err = new Error("Data of " + entry.hash.length + " bytes exceeds the " + Consts.maxDataLength + " byte limit. Consider setting connectors gzipData option. Can't post to: " + entry.url);
                        err.code = Consts.ErrorCodes.MessageSize;
                        errorCallback(err);
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
                    err.code = Consts.ErrorCodes.BadMessage;
                    callback(err);
                }
            }
        }, function (err) { return callback(err); });
    };
    AzureBotStorage.prototype.initializeStorageClient = function () {
        console.log("=========initializeStorageClient===========")
        var _this = docDbClient;
        if (!this.initializeTableClientPromise) {
            this.initializeTableClientPromise = new Promise(function (resolve, reject) {
               /* _this.storageClient.initialize(function (error) {
                    if (error) {
                        reject(new Error('Failed to initialize azure table client. Error: ' + error.toString()));
                    }
                    else {
                        resolve(true);
                    }
                });*/
            resolve(true);
            });
            //resolve(true);
        }
        return this.initializeTableClientPromise;
    };
    return AzureBotStorage;
}());
exports.AzureBotStorage = AzureBotStorage;
