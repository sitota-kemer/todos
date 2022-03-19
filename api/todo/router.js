/*
    - This file is a route handler for Article Controllers.
*/

// ------------------------------------
// Express
const express = require("express");

// Router
const router = express.Router();

// Todo Controller
const todoController = require("./controller");

// Auth
const auth = require("../auth");

router
  .route("/")
  .get(
    auth.protect,
    todoController.getAllTodos)
  .post(
    auth.protect,
    todoController.createTodo
  )
  .delete(
    auth.protect,
    todoController.deleteAllTodos
  );

router
  .route("/activeTodos")
  .get(
    auth.protect,
    todoController.getActiveTodos)

router
  .route("/doneTodos")
  .get(
    auth.protect,
    todoController.getDoneTodos)



router
  .route("/:id")
  .get(
     auth.protect,
    todoController.getTodo)
  .patch(
    auth.protect,
    todoController.updateTodo
  )
  .delete(
    auth.protect,
    todoController.deleteTodo
  );


router
  .route("/completeTodo/:id")
  .post(
     auth.protect,
    todoController.completeTodo)

// Export router
module.exports = router;
