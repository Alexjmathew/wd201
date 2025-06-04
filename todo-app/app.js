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
    // Validation for empty fields
    if (!request.body.title || request.body.title.trim() === '') {
      if (request.get('Content-Type') && request.get('Content-Type').includes('application/x-www-form-urlencoded')) {
        return response.redirect("/");
      }
      return response.status(422).json({ error: "Title cannot be empty" });
    }
    
    if (!request.body.dueDate || request.body.dueDate.trim() === '') {
      if (request.get('Content-Type') && request.get('Content-Type').includes('application/x-www-form-urlencoded')) {
        return response.redirect("/");
      }
      return response.status(422).json({ error: "Due date cannot be empty" });
    }

    // Convert the input date to en-CA format for consistency
    const inputDate = new Date(request.body.dueDate);
    const formattedDate = inputDate.toLocaleDateString("en-CA");

    const todo = await Todo.addTodo({
      title: request.body.title.trim(),
      dueDate: formattedDate
    });
    
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

// Mark todo as completed (API) - Fixed endpoint name to match test
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

// Keep the correct endpoint name as well for consistency
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

// Update todo (for toggling completion status)
app.put("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    
    // Toggle completion status or set specific status
    let updatedTodo;
    if (request.body.completed !== undefined) {
      updatedTodo = await todo.update({ completed: request.body.completed });
    } else {
      updatedTodo = await todo.update({ completed: !todo.completed });
    }
    
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

// Delete todo (API) - Fixed to return boolean directly
app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    const deleteCount = await Todo.destroy({ where: { id: request.params.id } });
    // Return boolean directly as expected by test
    return response.json(deleteCount > 0);
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
