const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Hello World");
});const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home page - Display todo website (NOT "Hello World")
app.get("/", async function (request, response) {
  try {
    const allTodos = await Todo.findAll({
      order: [['id', 'ASC']]
    });
    response.render("index", { allTodos });
  } catch (error) {
    console.log(error);
    response.render("index", { allTodos: [] });
  }
});

// API Routes for JSON responses
app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll({
      order: [['id', 'ASC']]
    });
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Create new todo (both form and API)
app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    
    // If it's a form submission, redirect back to home
    if (request.get('Content-Type') && request.get('Content-Type').includes('application/x-www-form-urlencoded')) {
      return response.redirect("/");
    }
    
    // Otherwise return JSON for API calls
    return response.json(todo);
  } catch (error) {
    console.log(error);
    if (request.get('Content-Type') && request.get('Content-Type').includes('application/x-www-form-urlencoded')) {
      return response.redirect("/");
    }
    return response.status(422).json(error);
  }
});

// Mark todo as completed (API)
app.put("/todos/:id/markASCompleted", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Toggle todo completion (for web interface)
app.post("/todos/:id/toggle", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.redirect("/");
    }
    
    await todo.update({ completed: !todo.completed });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.redirect("/");
  }
});

// Delete todo (API)
app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    const deleteTodo = await Todo.destroy({ where: { id: request.params.id } });
    response.json(deleteTodo ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Delete todo (for web interface)
app.post("/todos/:id/delete", async function (request, response) {
  try {
    await Todo.destroy({ where: { id: request.params.id } });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.redirect("/");
  }
});

module.exports = app;

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE
  const deleteTodo = await Todo.destroy({ where: { id: request.params.id } });
  response.send(deleteTodo ? true : false);
  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
});

module.exports = app;
