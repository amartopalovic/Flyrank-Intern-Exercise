require("dotenv").config();

const express = require("express");
const taskRepository = require("./taskRepository");
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

app.get("/tasks", async (req, res) => {
  const tasks = await taskRepository.getAll();
  res.json(tasks);
});

app.get("/tasks/:id", async (req, res) => {
  const task = await taskRepository.getById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const task = await taskRepository.create(title, req.body.done);

  res.status(201).json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const existing = await taskRepository.getById(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  const title = req.body.title ?? existing.title;
  const done = req.body.done !== undefined ? req.body.done : existing.done;

  const task = await taskRepository.update(req.params.id, title, done);
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  const deleted = await taskRepository.remove(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
