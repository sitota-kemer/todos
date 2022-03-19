/*
    - This file is a route handler for User Controllers.
*/

// -----------------------------------------------------
// Express
const express = require("express");

// Router
const router = express.Router();

// User Controller
const userController = require("./controller");

// Auth
const auth = require("../auth");

router
  .route("/")
  .post(
    userController.createUser
  )
  

router.post("/login", userController.login);

router
  .route("/:id")
  .get(
    auth.protect,
    userController.getUser
  )
  .delete(
    auth.protect,
    userController.deleteUser
  );

router.patch("/updatepassword", auth.protect, userController.updatePassword);

router.post("/forgotpassword", userController.forgotPassword);

router.patch("/resetpassword/:resetToken", userController.resetPassword);

router.patch("/updateUser", auth.protect, userController.updateUser);



// Export router
module.exports = router;
