const todos = [];

function add(todo) {
  todos.push(todo);
}

function all() {
  return todos;
}

function markAsComplete(index) {
  todos[index].completed = true;
}

function overdue() {
  const today = new Date();
  return todos.filter(
    (todo) =>
      !todo.completed &&
      new Date(todo.dueDate) < new Date(today.setHours(0, 0, 0, 0))
  );
}

function dueToday() {
  const today = new Date().toLocaleDateString("en-CA");
  return todos.filter(
    (todo) => todo.dueDate === today
  );
}

function dueLater() {
  const today = new Date();
  return todos.filter(
    (todo) =>
      !todo.completed &&
      new Date(todo.dueDate) > new Date(today.setHours(23, 59, 59, 999))
  );
}

function toDisplayableList(list) {
  return list
    .map((todo) => {
      const status = todo.completed ? "[x]" : "[ ]";
      const today = new Date().toLocaleDateString("en-CA");
      const displayDate = todo.dueDate === today ? "" : ` ${todo.dueDate}`;
      return `${status} ${todo.title}${displayDate}`;
    })
    .join("\n");
}

module.exports = {
  all,
  add,
  markAsComplete,
  overdue,
  dueToday,
  dueLater,
  toDisplayableList,
};



const todos = todoList();

const formattedDate = d => {
  return d.toISOString().split("T")[0]
}

var dateToday = new Date()
const today = formattedDate(dateToday)
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
)
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
)

todos.add({ title: 'Submit assignment', dueDate: yesterday, completed: false })
todos.add({ title: 'Pay rent', dueDate: today, completed: true })
todos.add({ title: 'Service Vehicle', dueDate: today, completed: false })
todos.add({ title: 'File taxes', dueDate: tomorrow, completed: false })
todos.add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false })

console.log("My Todo-list\n")

console.log("Overdue")
var overdues = todos.overdue()
var formattedOverdues = todos.toDisplayableList(overdues)
console.log(formattedOverdues)
console.log("\n")

console.log("Due Today")
let itemsDueToday = todos.dueToday()
let formattedItemsDueToday = todos.toDisplayableList(itemsDueToday)
console.log(formattedItemsDueToday)
console.log("\n")

console.log("Due Later")
let itemsDueLater = todos.dueLater()
let formattedItemsDueLater = todos.toDisplayableList(itemsDueLater)
console.log(formattedItemsDueLater)
console.log("\n\n")
