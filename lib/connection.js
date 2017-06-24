var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
//the MongoDB connection
var connectionInstance;

module.exports = function(callback) {
  //if already we have a connection, don't connect to database again
  if (connectionInstance) {
    callback(null,connectionInstance);
    return;
  }
		//db name		//db ip    db port
  var db = new Db('mc_prod', new Server("127.0.0.1",27017, { auto_reconnect: true }));
  db.open(function(error, databaseConnection) {
    //if (error) throw new Error(error);
    if (error){callback(error,null)}
    else{
      console.log("database connection successfully in  connection class")
      connectionInstance = databaseConnection;
      callback(null,databaseConnection);
    }
    
  });
};
