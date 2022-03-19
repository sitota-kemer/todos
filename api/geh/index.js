/*
    - This file is used as Global error handler to handle errors in different environments like
      Development, QA-Development, QA-Production and Production.  
 */

// ----------------------------------------------
// Custom modules
// Configs
const configs = require("../../loaders/configs");

// App Error
const AppError = require("../../utils/appError");

// Handle Dev error function
const sendDevError = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    errorStack: err.stack,
  });
};

// Handle Prod erros
const sendProdError = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "ERROR",
      message: "Opps!! Unknown Error",
    });
  }
};

// ----------------------------------------------
// Global error handler
const geh = function (err, req, res, next) {
  err.status = err.status || "ERROR";
  err.statusCode = err.statusCode || 500;

  // Handle Dev Errors
  if (configs.env === "development" || configs.env === "qa-development") {
    sendDevError(err, res);
  }

  // Handle Prod Errors
  if (configs.env === "production" || configs.env === "qa-production") {
    // Handle duplication error
    if (err.code === 11000) {
      err = new AppError("Data already exists", 400);
    }

    // Handle cast error
    if (err.name === "CastError") {
      err = new AppError("Invalid ID", 400);
    }

    // Handle token expired error
    if (err.name === "TokenExpiredError") {
      err = new AppError("Token expired. Please login", 400);
    }

    // Handle Invalid signature or json web token error
    if (err.name === "JsonWebTokenError") {
      err = new AppError("Invalid Token", 400);
    }

    sendProdError(err, res);
  }
};

// Export GEH
module.exports = geh;
