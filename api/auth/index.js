/*
    - This file is used as route protector.
    - It works using jwt created during login and check if the token exists on 
      request authorization header.
    - This file also includes authorization for each assigned roles to access 
      specified resources of the app.
*/

// -----------------------------------------
// jwt
const jwt = require("jsonwebtoken");

// -----------------------------------------
// Custom modules
// App Error
const AppError = require("../../utils/appError");

// Configs
const configs = require("../../loaders/configs");

// -------------------------------------------
// User model
const User = require("../user/model");

// ------------------------------------------
// Protect router
exports.protect = async function (req, res, next) {
  try {
    // Check if there is token on authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next(new AppError("Please login", 400));

    // Decode the token and check if the user exists and
    // also check if the token is expired or invalid
    const decodedData = jwt.verify(token, configs.jwt.secret);

    // Check if there is an user using the id since the token might work but
    // user does not exist
    const user = await User.findOne({ _id: decodedData.id });

    if (!user) return next(new AppError("User does not exist anymore", 400));

    // Check if user recently changed password
    if (user.checkPasswordChange(decodedData.iat)) {
      return next(
        new AppError(
          "You have recently changed password. Please login again",
          400
        )
      );
    }

    // Attach the user on the request object for further usage
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

