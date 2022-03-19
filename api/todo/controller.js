/*
    - This file is full controllers used for handling activies related to todos.
*/

// ----------------------------------------
// Todo
const Todo = require("./model");

// -----------------------------------------
// Custom modules
// App Error
const AppError = require("../../utils/appError");

// Configs
const configs = require("../../loaders/configs");

// ------------------------------------------
// Create todos
exports.createTodo = async function (req, res, next) {
  try {
    // Get body from request
    const { title, description, date} =
      req.body;

    // Check if all necessary fields exists
    if (!title  ||  !description )
      return next(new AppError("Fill all the necessary fields", 400));

    // Create new todo
    const newTodo = await Todo.create({
      title,
      description,
      date: Date.parse(date),
      author: req.user.userName,
      status: "active"
    });


  
      // Respond
      res.status(200).json({
        status: "SUCCESS",
        message: "New todo successfully created",
        data: {
          todo: newTodo,
        },
      });
    
  } catch (error) {
    next(error);
  }
};

// Get all todos
exports.getAllTodos = async function (req, res, next) {
  try {
   
    // Get all todos sorting it ascending by date
    const todos = await Todo.find({author: req.user.userName}).sort("-createdAt").lean();
 
    // Respond
    res.status(200).json({
      status: "SUCCESS",
      results: todos.length,
      data: {
        todos,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single todo
exports.getTodo = async function (req, res, next) {
  try {
    // Get a single todo using id
    const todo = await Todo.findById(req.params.id);

    if (todo.author !== req.user.userName)
      return next(new AppError("You don't have access", 400));
    // Respond
    res.status(200).json({
      status: "SUCCESS",
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get the active todos
exports.getActiveTodos = async function (req, res, next) {
  try {
  
    const todos = await Todo.aggregate([
  {
    '$match': {
      'author' : req.user.userName,
      'status': 'active',
      
    }
  }]);

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      results: todos.length,
      data: {
        todos,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get the done todos
exports.getDoneTodos = async function (req, res, next) {
  try {
  
    const todos = await Todo.aggregate([
  {
    '$match': {
      'author' : req.user.userName,
      'status': 'done'
    }
  }]);

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      results: todos.length,
      data: {
        todos,
      },
    });
  } catch (error) {
    next(error);
  }
};



// Update todo
exports.updateTodo = async function (req, res, next) {
  try {
    // Get body from request
    const { title, description, date} = req.body;

    // Check if admin want to update posted by
    if (req.body.author)
      return next(new AppError("You can not update author", 400));

    const todo = await Todo.findById(req.params.id);

    if (todo.author !== req.user.userName)
      return next(new AppError("You don't have access", 400));

    if(title){
      todo.title=title;
    }

    if(description){
      todo.description=description;
    }

    if(date){
      todo.date=date;
    }
    await todo.save();

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Todo successfully updated",
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Complete todo
exports.completeTodo = async function (req, res, next) {
  try {

     const todo = await Todo.findById(req.params.id);

    if (todo.author !== req.user.userName)
      return next(new AppError("You don't have access", 400));

    todo.status= "done";
    await todo.save();

    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Todo successfully completed",
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete todo
exports.deleteTodo = async function (req, res, next) {
  try {
    
     const todo = await Todo.findById(req.params.id);

    if (todo.author !== req.user.userName)
      return next(new AppError("You don't have access", 400));

    todo.status= "done";
    await todo.delete();
    // Respond
    res.status(200).json({
      status: "SUCCESS",
      message: "Todo successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Delete all todos
exports.deleteAllTodos = async function (req, res, next) {
  try {
    // Get body from request
    const confirmation = req.body.confirmation;

    // Check if confirmation field is filled
    if (!confirmation)
      return next(new AppError("Fill confirmation field", 400));

    // Check if confirmation is yes and respond back with message and delete all todos
    if (confirmation === "yes") {
      await Todo.deleteMany({author: req.user.userName} );
      res.status(200).json({
        status: "SUCCESS",
        message: "All todos are successfully deleted",
      });
    } else {
      res.status(400).json({
        status: "FAIL",
        message: "Deletion of todos is cancelled.",
      });
    }
  } catch (error) {
    next(error);
  }
};
