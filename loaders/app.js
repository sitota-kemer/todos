/*
    - This file is used to handle the global application which will be used as a web server.
    - app which is the global application is exported for starting the server.
    - All routers in this application are used here.
    - Unknown URLs are also handled.
    - The global error handler is called finally for handling errors both programming and operational.
*/

// ------------------------------------------------
// Built in modules

// ------------------------------------------------
// Third party modules
const express = require("express");

const app = express();

const helmet = require("helmet");

const csp = require("helmet-csp");

const morgan = require("morgan");

const xss = require("xss-clean");

const hpp = require("hpp");

const compression = require("compression");

const cookieParser = require("cookie-parser");

const limiter = require("express-rate-limit");

const mongoSanitizer = require("express-mongo-sanitize");

// -----------------------------------------------------
// Custom modules
// App Error
const AppError = require("../utils/appError");

// Global error handler
const geh = require("../api/geh");

// -------------------------------------------------------
// Router
// User Router
const userRouter = require("../api/user/router");

// Todo Router
const todoRouter = require("../api/todo/router");



// -------------------------------------------------------
// Use third party modules
app.use(compression());

app.use(cookieParser());

app.use(helmet());

/** Use more modules here */

// --------------------------------------------------------
// Use built in modules
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// ----------------------------------------------------------
// Use routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/todos", todoRouter);


// ----------------------------------------------------------
// Handle url which don't exist
app.use("*", function (req, res, next) {
  return next(
    new AppError(
      `Unknown URL - ${req.protocol}://${req.get("host")}${req.originalUrl}`,
      404
    )
  );
});

// -------------------------------------------------------
// Use global error handler
app.use(geh);

// --------------------------------------------------------
// Export global app
module.exports = app;
