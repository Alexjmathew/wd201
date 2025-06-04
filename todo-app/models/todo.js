/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
//const todo = require("../models/todo");
let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite ", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  
  test("Create new todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Go to movie",
      dueDate: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); //http status code
  });

  test("Mark todo as completed (Updating Todo)", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
    const status = latestTodo.completed ? false : true;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: status,
    });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Delete todo using ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Go to shopping",
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const parsedDeleteResponse = JSON.parse(response.text);
    expect(parsedDeleteResponse.success).toBe(true);
  });

  test("Should not create a todo item with empty title", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "",
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(422);
  });

  test("Should not create a todo item with empty dueDate", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Test todo",
      dueDate: "",
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(422);
  });

  test("Should create sample due today item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const today = new Date().toISOString().split('T')[0];
    const response = await agent.post("/todos").send({
      title: "Due today task",
      dueDate: today,
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Should create sample due later item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const response = await agent.post("/todos").send({
      title: "Due later task",
      dueDate: tomorrow.toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Should create sample overdue item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const response = await agent.post("/todos").send({
      title: "Overdue task",
      dueDate: yesterday.toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Should toggle a completed item to incomplete when clicked on it", async () => {
    // First create a todo
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Toggle test",
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      _csrf: csrfToken,
    });

    // Get the todo and mark it as completed
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    // Mark as completed
    await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: true,
    });

    // Now toggle back to incomplete
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: false,
    });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });
});
