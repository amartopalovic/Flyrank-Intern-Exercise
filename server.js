const express = require("express");
const taskRepository = require("./taskRepository");
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
  const tasks = taskRepository.getAll();
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const task = taskRepository.getById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const task = taskRepository.create(title, req.body.done);

  res.status(201).json(task);
});

app.put("/tasks/:id", (req, res) => {
  const existing = taskRepository.getById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  const title = req.body.title ?? existing.title;
  const done = req.body.done !== undefined ? req.body.done : existing.done;

  const task = taskRepository.update(req.params.id, title, done);
  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const deleted = taskRepository.remove(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
