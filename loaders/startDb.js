/*
    - This file is used to connect with our DB.
    - The DB is remote and can be found on MongoDB Atlas.
    - The db connection is exported in order to close the DB when the application 
      is close and handle errors during connecting and disconnecting times since 
      mongoose connection is an event emitter.
      This is called Majestic close.  
*/

// ---------------------------------------------
// Connect to Remote DB
// Mongoose
const mongoose = require("mongoose");

// Configs
const configs = require("./configs");

mongoose
  .connect(configs.db.remote)
  .then(function (conn) {
    console.log("DB Successfully connected");
  })
  .catch(function (err) {
    console.log("Error");
    console.log(err);
  });

// DB Connection
const dbConnection = mongoose.connection;

// Handle events for DB connection
dbConnection.on("disconnected", function () {
  console.log("DB Disconnected");
});

dbConnection.on("error", function (err) {
  console.log("Error");
  console.log(err);
});

// Export DB Connection
module.exports = dbConnection;
