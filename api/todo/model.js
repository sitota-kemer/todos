/*
    - This file is a Schema for Todos.
    - The model which is created using the schema is exported for further usage.
    - The pattern is Model export since we have only one DB connection.
*/

// -------------------------------------------
// mongoose
const mongoose = require("mongoose");

// Todo Schema
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title of the todo is required"],
      minlength: [
        2,
        "Title of the todo can not be less than 2 characters",
      ],
      maxlength: [255, "Title of the todo can not exceed 255 characters"],
      unique: true,
    },
    author: {
      type: String,
      required: [true, "Author of todo is required"]
    },
    description: {
      type: String,
      required: [true, "Description of the todo is required"],
      minlength: [10, "Description of the todo can not be 10 characters"],
      maxlength: [
        255,
        "Description of the todo can not exceed 255 characters",
      ],
    },
    status: {
      type: String,
      required: true,
       enum: {
        values: ["active", "done"],
        message: "Unknown status for the todo",
      },
    },
    date: {
        type: Date
    },
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

// --------------------------------------------------
// Create index
todoSchema.index(
  { author: "text" },
  { background: true },
  { weights: { author: 10 } }
);

// --------------------------------------------------
// Todo model
const Todo = mongoose.model("Todo", todoSchema);

// Export Todo model
module.exports = Todo;
