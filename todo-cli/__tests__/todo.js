const { all, add, markAsComplete, overdue, dueToday, dueLater, toDisplayableList } = require("../todo");

/* eslint-disable no-undef */
describe("Todolist Test Suite", () => {
  beforeAll(() => {
    const today = new Date();
    const oneDay = 60 * 60 * 24 * 1000;
    [
      {
        title: "Pay rent",
        dueDate: new Date(today.getTime() - oneDay).toLocaleDateString("en-CA"),
        completed: false,
      },
      {
        title: "Service Vehicle",
        dueDate: new Date().toLocaleDateString("en-CA"),
        completed: false,
      },
      {
        title: "File taxes",
        dueDate: new Date(today.getTime() + oneDay).toLocaleDateString("en-CA"),
        completed: false,
      },
    ].forEach(add);
  });

  test("Should add a new todo", () => {
    const todoCount = all.length;
    add({
      title: "New Todo",
      dueDate: new Date().toLocaleDateString("en-CA"),
      completed: false,
    });
    expect(all.length).toBe(todoCount + 1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should retrieve overdue items", () => {
    const overdueItems = overdue();
    expect(overdueItems.length).toBe(1);
    expect(overdueItems[0].title).toContain("Pay rent");
  });

  test("Should retrieve due today items", () => {
    const dueTodayItems = dueToday();
    expect(dueTodayItems.length).toBe(2); // Service Vehicle + New Todo
    expect(dueTodayItems.some(item => item.title.includes("Service Vehicle"))).toBe(true);
    expect(dueTodayItems.some(item => item.title.includes("New Todo"))).toBe(true);
  });

  test("Should retrieve due later items", () => {
    const dueLaterItems = dueLater();
    expect(dueLaterItems.length).toBe(1);
    expect(dueLaterItems[0].title).toContain("File taxes");
  });

  test("Should format displayable list correctly", () => {
    const displayableList = toDisplayableList(all);
    expect(displayableList).toContain("[x] Pay rent");
    expect(displayableList).toContain("[ ] Service Vehicle");
    expect(displayableList).toContain("[ ] File taxes");
    expect(displayableList).toContain("[ ] New Todo");
  });
});
