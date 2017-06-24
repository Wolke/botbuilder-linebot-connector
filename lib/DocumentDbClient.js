"use strict";
var Consts = require('./Consts');
var documentdb_1 = require('documentdb');
var DocumentDbClient = (function () {
    function DocumentDbClient(options) {
        this.options = options;
    }
    DocumentDbClient.prototype.initialize = function (callback) {
        var _this = this;
        var client = new documentdb_1.DocumentClient(this.options.host, { masterKey: this.options.masterKey });
        this.client = client;
        this.getOrCreateDatabase(function (error, database) {
            if (error) {
                callback(DocumentDbClient.getError(error));
            }
            else {
                _this.database = database;
                _this.getOrCreateCollection(function (error, collection) {
                    if (error) {
                        callback(DocumentDbClient.getError(error));
                    }
                    else {
                        _this.collection = collection;
                        callback(null);
                    }
                });
            }
        });
    };
    DocumentDbClient.prototype.insertOrReplace = function (partitionKey, rowKey, entity, isCompressed, callback) {
        var docDbEntity = { id: partitionKey + ',' + rowKey, data: entity, isCompressed: isCompressed };
        this.client.upsertDocument(this.collection._self, docDbEntity, {}, function (error, collection, responseHeaders) {
            callback(DocumentDbClient.getError(error), null, responseHeaders);
        });
    };
    DocumentDbClient.prototype.retrieve = function (partitionKey, rowKey, callback) {
        var id = partitionKey + ',' + rowKey;
        var querySpec = {
            query: Consts.DocDbRootQuery,
            parameters: [{
                    name: Consts.DocDbIdParam,
                    value: id
                }]
        };
        var iterator = this.client.queryDocuments(this.collection._self, querySpec, {});
        iterator.toArray(function (error, result, responseHeaders) {
            if (error) {
                callback(DocumentDbClient.getError(error), null, null);
            }
            else if (result.length == 0) {
                callback(null, null, null);
            }
            else {
                var document_1 = result[0];
                callback(null, document_1, null);
            }
        });
    };
    DocumentDbClient.getError = function (error) {
        if (!error)
            return null;
        return new Error('Error Code: ' + error.code + ' Error Body: ' + error.body);
    };
    DocumentDbClient.prototype.getOrCreateDatabase = function (callback) {
        var _this = this;
        var querySpec = {
            query: Consts.DocDbRootQuery,
            parameters: [{
                    name: Consts.DocDbIdParam,
                    value: this.options.database
                }]
        };
        this.client.queryDatabases(querySpec).toArray(function (error, result, responseHeaders) {
            if (error) {
                callback(error, null);
            }
            else if (result.length == 0) {
                _this.client.createDatabase({ id: _this.options.database }, {}, function (error, database) {
                    if (error) {
                        callback(error, null);
                    }
                    else {
                        callback(null, database);
                    }
                });
            }
            else {
                callback(null, result[0]);
            }
        });
    };
    DocumentDbClient.prototype.getOrCreateCollection = function (callback) {
        var _this = this;
        var querySpec = {
            query: Consts.DocDbRootQuery,
            parameters: [{
                    name: Consts.DocDbIdParam,
                    value: this.options.collection
                }]
        };
        this.client.queryCollections(this.database._self, querySpec).toArray(function (error, result, responseHeaders) {
            if (error) {
                callback(error, null);
            }
            else if (result.length == 0) {
                _this.client.createCollection(_this.database._self, { id: _this.options.collection }, {}, function (error, collection) {
                    if (error) {
                        callback(error, null);
                    }
                    else {
                        callback(null, collection);
                    }
                });
            }
            else {
                callback(null, result[0]);
            }
        });
    };
    return DocumentDbClient;
}());
exports.DocumentDbClient = DocumentDbClient;
