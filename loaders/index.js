/*
    - This file is used as combiner and start the server which will be called 
      on index.js to ignite or start the application.
    - The function is exported below.
*/

//-----------------------------------------
// Built in modules
// http
const http = require("http");

// ----------------------------------------
// Configs
const configs = require("./configs");

// DB Connection
const dbConnection = require("./startDb");

// Global application
const app = require("./app");

// Start server - Igniter function
module.exports = function () {
  const server = http.createServer(app);

  server.listen(configs.port, configs.host, function () {
    console.log(`Listening on ${configs.host}:${configs.port}...`);
  });

  // Majestic close
  process.on("SIGINT", function () {
    server.close(function () {
      console.log("Server is closing");
      dbConnection.close(function () {
        console.log("DB is closing");
      });
    });
  });
};
