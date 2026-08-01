const express = require("express");
const db = require("./db");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API is working",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
