/*
    - This file is used to handle Custom errors using Custom error class called AppError.
    - The AppError constuctor inherits from the Main Error constructor.
    - Error which are from the user side are operational.
    - Errors with status code which starts with 4 have status of FAIL. Whereas errors with status
      code which starts with 5 have status of ERROR.  
*/

// ---------------------------------------
// App Error
const AppError = function (message, statusCode) {
  Error.call(this, message);
  this.message = message;
  this.statusCode = statusCode;
  this.status = `${this.statusCode}`.startsWith("4") ? "FAIL" : "ERROR";
  this.isOperational = true;

  // Capture error stack for more detailed information
  Error.captureStackTrace(this, this.constructor);
};

// Export App Error
module.exports = AppError;
