var restify = require('restify');
var builder = require('botbuilder');

var istorage= require('./lib/IStorageClient');
var azure = require('./lib/AzureBotStorage.js');


//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3980, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId:"appid here",
    appPassword:"app password here"
});



// Listen for messages from users 
server.post('/api/messages', connector.listen());


//Store session and context into mnongodb
var docDbClient = new istorage.IStorageClient();
var tableStorage = new azure.AzureBotStorage({ gzipData: false },docDbClient);
var bot = new builder.UniversalBot(connector).set('storage', tableStorage);//set your storage here

bot.use(builder.Middleware.dialogVersion({ version: 3.0, resetCommand: /^reset/i }));


bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
