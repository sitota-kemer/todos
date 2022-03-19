/*
    - This file is a Schema for user.
    - The model which is created using the schema is exported for further usage.
    - The pattern is Model export since we have only one DB connection.
*/

// ---------------------------------------------
// Mongoose
const mongoose = require("mongoose");

// ---------------------------------------------
// Third party modules
// Validator
const validator = require("validator");

// Bcryptjs
const bcrypt = require("bcryptjs");

// ----------------------------------------------
// Built in modules
// Crypto
const crypto = require("crypto");

// ----------------------------------------------
// user Schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name of the user is required"],
      maxlength: [100, "Full name of the user can not exceed 100 characters"],
      minlength: [
        10,
        "Full name of the user can not be less than 2 characters",
      ],
    },
    userName: {
      type: String,
      required: [true, "User name of the user is required"],
      maxlength: [100, "User name of the user can not exceed 100 characters"],
      minlength: [
        5,
        "User name of the user can not be less than 2 characters",
      ],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email of the user is required"],
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number of the user is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password can not be less than 8 characters"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password confirm is required"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and Password confirm must be the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    writeConcern: {
      w: "majority",
      j: true,
    },
  }
);

// ------------------------------------------------------
// Hash the password before saving it to the DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Check if password changes and add passwordChangedAt time stamp
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

// Instance method for checking password
userSchema.methods.checkPassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

// Instance method to check password changed time stamp with jwt timestamp
userSchema.methods.checkPasswordChange = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    return jwtTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
  return false;
};

// Create reset token
userSchema.methods.createResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and put it on password reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the password reset token expire date to 1 hour
  this.passwordResetTokenExpiresAt = Date.now() + 60 * 60 * 1000;

  // Return the token which is not hashed
  return resetToken;
};

// -----------------------------------------------------
// User Model
const User = mongoose.model("User", userSchema);

// ------------------------------------------------------
// Export User model
module.exports = User;
