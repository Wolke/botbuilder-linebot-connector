var assert = require('assert');
var builder = require('../');

describe('ChatConnector', function () {

    it('should return unauthorized when authorization header missing', function (done) {
        var returnedStatus = null;

        var connector = new builder.ChatConnector();
        connector.verifyBotFramework({
            body: {
                channelId: 'dummy'
            },
            headers: {}
        },
        {
            status: function (status) {
                returnedStatus = status;
            },
            end: function () {
                assert(returnedStatus === 401);
                done();
            }
        });
    });

    it('does a case-insensitive lookup for the authorization header', function (done) {
        var connector = new builder.ChatConnector();

        var dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlzcyI6IkZvbyIsImF1ZCI6IkJhciJ9.kJg0_cM8lSyYrXRa09HBiy-xfI8QbeoPaeXb2v8RI_g';
        var dummySecret = 'secret';
        var dummyChannel = 'dummyChannel';

        connector.settings.endpoint.botConnectorIssuer = 'Foo';
        connector.settings.endpoint.botConnectorAudience = 'Bar';

        connector.botConnectorOpenIdMetadata = {
            getKey: function (dummy, callback) {
                callback(dummySecret);
            }
        };

        var verifyDispatch = function (headers, callback) {
            connector.dispatch = function (body) {
                assert(body.channelId === dummyChannel);
                callback();
            };
            connector.verifyBotFramework({
                body: {
                    channelId: dummyChannel
                },
                headers: headers
            });
        };

        // Verify first with lower case authorization header.
        verifyDispatch({
            authorization: 'Bearer ' + dummyToken
        }, function () {
            // Do a second verification with authorization header
            // that starts with an upper case letter.
            verifyDispatch({
                Authorization: 'Bearer ' + dummyToken
            }, function () {
                done();
            });
        });
    });
});
