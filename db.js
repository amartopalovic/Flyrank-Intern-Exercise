const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
  await pool.query(schema);

  const { rows } = await pool.query("SELECT COUNT(*) AS count FROM tasks");

  if (Number(rows[0].count) === 0) {
    await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)",
      ["Buy milk", false, "Walk the dog", false, "Finish SQLite assignment", true]
    );
  }
}

module.exports = { pool, init };
