https://drive.google.com/file/d/0B0_ddFOVPj0xNUpfek1tTFpsVG8/view

# BotBuilder-MongoDB
Bot builder with Mongo Db(custom storage )

## Introduction 
This example code is written to show how we can store our bot session data into MongoDb

## Motivation
Microsoft bot builder bydefault store data  internally in Microsoft storage which have 64 Kb size limit per user.Other option to store data is Microsoft Azure Table and Microsoft Document Db.which doesn't have any data limit per user.
Alternet solution is MongoDb.Installing mongdb in one server and storing our data in mongo db is much much chipper.
So inorder to store session data into Mongo Db i implemented IstorageClient Interface.

## Code Sample

> "use strict";
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





## Require Module 
1. sudo npm install azure-storage
2. sudo npm install mongodb --save

## Steps and Code Details
Mongo Db Ip address and Mongo Port in config/conf.js

I implemented IStorageClient(lib/IStorageClient.js) interface which internally use replaceDot(lib/replaceDot.js).

I am  replacing dot with @ in each key during insertion time,because Mongo Db doesn't support "." in key.

Same Code using to change @ to . After MongoDB document fetch.It will not effect to futionality


//Store session and context into mnongodb

var docDbClient = new istorage.IStorageClient();  //here is our logic to store data into mongo db  

var tableStorage = new azure.AzureBotStorage({ gzipData: false },docDbClient); //passing object to here

var bot = new builder.UniversalBot(connector).set('storage', tableStorage);//set your storage here

## Reference Link:
1.[https://drive.google.com/file/d/0B0_ddFOVPj0xNUpfek1tTFpsVG8/view](https://drive.google.com/file/d/0B0_ddFOVPj0xNUpfek1tTFpsVG8/view)
2. [https://github.com/Microsoft/BotBuilder/issues/1943](https://github.com/Microsoft/BotBuilder/issues/1943)
3. [http://stackoverflow.com/questions/43153824/how-to-store-session-data-into-custom-storage-in-bot-builder](http://stackoverflow.com/questions/43153824/how-to-store-session-data-into-custom-storage-in-bot-builder)
