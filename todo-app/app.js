const express = require("express");
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

// Home page - Display todo website
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
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Create new todo (handles both form and API)
app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    
    if (request.get('Content-Type') && request.get('Content-Type').includes('application/x-www-form-urlencoded')) {
      return response.redirect("/");
    }
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
app.put("/todos/:id/markAsCompleted", async function (request, response) {
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
    const deleteCount = await Todo.destroy({ where: { id: request.params.id } });
    return response.json({ success: deleteCount > 0 });
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
