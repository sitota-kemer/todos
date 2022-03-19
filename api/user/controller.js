/*
    - This file is full of controllers used for handling user activities.
    - Login, Signup, Update password, Forgot password, Reset password, Update personal data and
      related activities.
*/

// -------------------------------------------
// User model
const User = require("./model");

// ----------------------------------------------
// Third party modules
const jwt = require("jsonwebtoken");

// Send grid
const sendGrid = require("@sendgrid/mail");

// -----------------------------------------------
// Built in modules
// Crypto
const crypto = require("crypto");

// -----------------------------------------------
// Custom modules
// App Error
const AppError = require("../../utils/appError");

// Configs
const configs = require("../../loaders/configs");

// ----------------------------------------------
// Sign Token
const signToken = function (payload) {
  const token = jwt.sign({ id: payload }, configs.jwt.secret, {
    expiresIn: configs.jwt.expiresin,
  });
  return token;
};

// ------------------------------------------------
// Create user
exports.createUser = async function (req, res, next) {
  try {
    // Get body from request
    const { fullName, userName, email, phoneNumber, password, passwordConfirm } = req.body;

    // Check if all inputs exists
    if (!fullName || !userName || !email || !phoneNumber || !password || !passwordConfirm)
      return next(new AppError("Fill all the necessary inputs", 400));


    // Create User
    const newUser = await User.create({
      fullName,
      userName,
      email,
      phoneNumber,
      password,
      passwordConfirm,
    });

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: `${userName}'s account is successfully created`,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getAllUsers = async function (req, res, next) {
  try {

    const users = await User.find().lean();

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single user
exports.getUser = async function (req, res, next) {
  try {
    // Get an user using id
    const user = await User.findById(req.params.id);

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async function (req, res, next) {
  try {
    // Get body from request
    const { loginInfo, password } = req.body;

    // Check if all fields exists
    if (!loginInfo || !password)
      return next(new AppError("Fill all the necessary fields", 400));

    // Check if there is an user with the specified loginInfo and password
    // Get user
    const user = await User.findOne({
      $or: [
        { email: loginInfo },
        { userName: loginInfo },
        { phoneNumber: loginInfo },
      ],
    });

    if (!user || !(await user.checkPassword(password, user.password)))
      return next(new AppError("Invalid login info or password", 400));

    // Generate JWT token
    const token = signToken(user._id);

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Successfully logged in",
      data: {
        user,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async function (req, res, next) {
  try {
    // Get body from request
    const { fullName, email, phoneNumber } = req.body;

    // Check if an user want to change user name and send a message you can
    // not update your user name once you set it
    if (req.body.userName)
      return next(
        new AppError("You can not update your user name once you set it.", 400)
      );

    // Check if an user want to update password using this link
    if (req.body.password || req.body.passwordConfirm)
      return next(
        new AppError(
          "You can not update your password using this link. Use the update password feature.",
          400
        )
      );

    // Update user using users id coming from protect route
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        email,
        phoneNumber,
      },
      { runValidators: true, new: true }
    );

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Personal information successfully updated",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Update password
exports.updatePassword = async function (req, res, next) {
  try {
    // Get the request body
    const { currentPassword, password, passwordConfirm } = req.body;

    // Check if all the necessary fields exists
    if (!currentPassword || !password || !passwordConfirm)
      return next(new AppError("Fill all the necessary fields", 400));

    // Get the user to make sure he or she is logged in using the user
    // data coming from the request object from protect route
    const user = await User.findById(req.user._id);

    // Check if the user exists and the current password is similar to the
    // one in the database
    if (!(await user.checkPassword(currentPassword, user.password))) {
      return next(new AppError("Incorrect current password", 400));
    }

    // Update the password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Password successfully updated",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async function (req, res, next) {
  try {
    // Get body from request
    const { loginInfo } = req.body;

    // Check if all the necessary fields exists
    if (!loginInfo)
      return next(new AppError("Fill all the necessary fields", 400));

    // Check if there is an user with the specified login info
    const user = await User.findOne({
      $or: [
        { email: loginInfo },
        { phoneNumber: loginInfo },
        { userName: loginInfo },
      ],
    });

    if (!user)
      return next(
        new AppError("There is no user. Fill the correct login info", 400)
      );

    // Create a reset token
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    // Password reset url or link
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetpassword/${resetToken}`;

    // Send the reset link to the user using send grid
    // Set api key
    sendGrid.setApiKey(configs.email.api);

    // Create message
    const message = {
      from: {
        name: "Kemer Code",
        email: configs.email.from,
      },
      to: user.email,
      subject: "Password reset link - Expires with in 1 hour",
      text: `Hello ${user.fullName}. Here is your password reset link. It will expire with in 1 hour. 
      Password reset link -> ${resetUrl}
      `,
      html: `<h1> Hello ${user.fullName} </h1>
      <p> Here is your password reset link. It will expire with in 1 hour. 
      Password reset link -> <a href="${resetUrl}">${resetUrl}</a> </p>
      `,
    };

    // Send the email
    sendGrid
      .send(message)
      .then(function (response) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Email successfully sent",
        });
      })
      .catch(async function (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt = undefined;
        await user.save({ validateBeforeSave: false });
        next(new AppError("Unable to send email.", 400));
      });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async function (req, res, next) {
  try {
    // Get body from request
    const { password, passwordConfirm } = req.body;

    // Check if all necessary fields exists
    if (!password || !passwordConfirm)
      return next(new AppError("Fill all the necessary fields", 400));

    // Check if the reset token exists or expired
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // Get user using the hashed token and compare the password reset token
    // expires time stamp with the current time
    const user = await User.findOne({
      $and: [
        { passwordResetToken: hashedResetToken },
        { passwordResetTokenExpiresAt: { $gt: Date.now() } },
      ],
    });

    if (!user)
      return next(new AppError("Invalid or expired password reset link", 400));

    // Update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Password resetted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async function (req, res, next) {
  try {
    // Delete an user using id
    await User.findByIdAndDelete(req.params.id);

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "User account successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Delete all users
exports.deleteAllUsers = async function (req, res, next) {
  try {
    // Get body from request
    const confirmation = req.body.confirmation;

    // Check if confirmation is yes and respond back with message and delete users
    if (confirmation === "yes") {
      await User.deleteMany();
      res.status(200).json({
        status: "SUCCESS",
        message: "All users are successfully deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};
