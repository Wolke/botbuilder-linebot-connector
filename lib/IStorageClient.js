"use strict";
var Consts = require('./Consts');
var mongodb_1 = require("mongodb");
var replaceDot_Atrate = require("./replaceDot");
var mongoDbConnection = require('./connection.js');
var conf = require('../config/conf.js');
var collectionName =conf.CollectionName;

var IStorageClient = (function () {
    function IStorageClient(options) {
        this.options = options;
    }
    
    IStorageClient.prototype.retrieve = function (partitionKey, rowKey, callback) {
        var id = partitionKey + ',' + rowKey;
        if(rowKey!=="userData"){
            var query={"$and":[{"userid":id}]}
                mongoDbConnection(function(err,db) {
                var iterator= db.collection(collectionName).find(query);
                iterator.toArray(function (error, result, responseHeaders) {
                    if (error) {
                        console.log("Error",error)
                        callback(error, null, null);
                    }
                    else if (result.length == 0) {
                        callback(null, null, null);
                    }
                    else {
                        var document_1 = result[0];
                        var finaldoc=replaceDot_Atrate.substituteKeyDeep(document_1, /\@/g, '.');
                        finaldoc["id"]=id
                        callback(null, finaldoc, null);
                    }
                });
            }); 
        }
        else{
            var query={"$and":[{"userid":partitionKey}]}
            mongoDbConnection(function(err,db) { 

                var iterator= db.collection(collectionName).find(query);
                iterator.toArray(function (error, result, responseHeaders) {
                    if (error) {
                        callback(error, null, null);
                    }
                    else if (result.length == 0) {
                        callback(null, null, null);
                    }
                    else {
                        var document_1 = result[0];
                        callback(null, document_1, null);
                    }
                });
            });
        }
    };
    
    IStorageClient.prototype.initialize = function (callback) {
        var _this = this;
        var client=mongodb_1.MongoClient;
        this.client = client;
     
        mongoDbConnection(function(err,database) {    
                _this.database = database;
                _this.collection = database.collection(collectionName);
                callback(null);
         });
    };

    IStorageClient.prototype.insertOrReplace = function (partitionKey, rowKey, entity, isCompressed, callback) {
        var id=partitionKey + ',' + rowKey
        var docDbEntity = { id: partitionKey + ',' + rowKey, data: entity, isCompressed: isCompressed };
        if(rowKey!=="userData"){
            var newEntitiy=replaceDot_Atrate.substituteKeyDeep(entity, /\./g, '@');
            var conditions1 = {
                'userid': id
            };
            var updateobj1 = {
                "$set": {"data":newEntitiy,"isCompressed":false}
            };   
            mongoDbConnection(function(error,db) {    
                db.collection(collectionName).update(conditions1,updateobj1,{upsert: true},function(err,res){
                callback(error, null,"");
            });
            });
        }
        else{
            var conditions = {
                'userid': partitionKey
            };
            var update = {
                "$set": {"data":entity}
            }
            mongoDbConnection(function(error,db) {    
                db.collection(collectionName).update(conditions,update,{upsert: true},function(err,res){
                callback(error, null,"");
           })
        });
        } 
    };
    
    IStorageClient.getError = function (error) {
        if (!error)
            return null;
        return new Error('Error Code: ' + error.code + ' Error Body: ' + error.body);
    };
    
    return IStorageClient;
}());
exports.IStorageClient = IStorageClient;
