"use strict";
var Consts = require('./Consts');
var azure = require('azure-storage');
var AzureTableClient = (function () {
    function AzureTableClient(tableName, accountName, accountKey) {
        if (!accountName && !accountKey) {
            this.useDevelopmentStorage = true;
        }
        else if (!accountName || !accountKey) {
            throw Error('Storage account name and account key are mandatory when not using development storage');
        }
        this.accountName = accountName;
        this.accountKey = accountKey;
        this.tableName = tableName;
    }
    AzureTableClient.prototype.initialize = function (callback) {
        var tableService = this.buildTableService();
        tableService.createTableIfNotExists(this.tableName, function (error, result, response) {
            callback(AzureTableClient.getError(error, response));
        });
    };
    AzureTableClient.prototype.insertOrReplace = function (partitionKey, rowKey, data, isCompressed, callback) {
        var tableService = this.buildTableService();
        var entityGenerator = azure.TableUtilities.entityGenerator;
        var entity = {
            PartitionKey: entityGenerator.String(partitionKey),
            RowKey: entityGenerator.String(rowKey),
            Data: entityGenerator.String((data instanceof String) ? data : JSON.stringify(data)),
            IsCompressed: entityGenerator.Boolean(isCompressed)
        };
        tableService.insertOrReplaceEntity(this.tableName, entity, { checkEtag: false }, function (error, result, response) {
            callback(AzureTableClient.getError(error, response), result, response);
        });
    };
    AzureTableClient.prototype.retrieve = function (partitionKey, rowKey, callback) {
        var tableService = this.buildTableService();
        tableService.retrieveEntity(this.tableName, partitionKey, rowKey, function (error, result, response) {
            if (response.statusCode == Consts.HttpStatusCodes.NotFound) {
                callback(null, null, response);
            }
            else {
                callback(AzureTableClient.getError(error, response), AzureTableClient.toBotEntity(result), response);
            }
        });
    };
    AzureTableClient.toBotEntity = function (tableResult) {
        if (!tableResult) {
            return null;
        }
        var entity = {
            data: {},
            isCompressed: tableResult.IsCompressed['_'] || false,
            rowKey: tableResult.RowKey['_'] || '',
            partitionKey: tableResult.PartitionKey['_'] || ''
        };
        if (tableResult.Data['_'] && entity.isCompressed) {
            entity.data = tableResult.Data['_'];
        }
        else if (tableResult.Data['_'] && !entity.isCompressed) {
            entity.data = JSON.parse(tableResult.Data['_']);
        }
        return entity;
    };
    AzureTableClient.prototype.buildTableService = function () {
        var tableService = this.useDevelopmentStorage
            ? azure.createTableService(Consts.developmentConnectionString)
            : azure.createTableService(this.accountName, this.accountKey);
        return tableService.withFilter(new azure.ExponentialRetryPolicyFilter());
    };
    AzureTableClient.getError = function (error, response) {
        if (!error)
            return null;
        var message = 'Failed to perform the requested operation on Azure Table. Message: ' + error.message + '. Error code: ' + error.code;
        if (response) {
            message += '. Http status code: ';
            message += response.statusCode;
        }
        return new Error(message);
    };
    return AzureTableClient;
}());
exports.AzureTableClient = AzureTableClient;
