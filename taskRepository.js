const db = require("./db");

function getAll() {
  return db.prepare("SELECT * FROM tasks").all();
}

function getById(id) {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
}

function create(title, done) {
  const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title, done ? 1 : 0);

  return getById(result.lastInsertRowid);
}

function update(id, title, done) {
  const result = db
    .prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?")
    .run(title, done ? 1 : 0, id);

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}

module.exports = { getAll, getById, create, update, remove };
