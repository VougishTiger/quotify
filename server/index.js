const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const db = require("./db");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("❌ JWT_SECRET is not defined");
}
const authenticateToken = require("./auth.js");
const authRoutes = require("./authRoutes.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const init = async () => {
  try {
   
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT,
        user_id INTEGER REFERENCES users(id)
      )
    `);

    console.log("✅ Connected to DB and ensured tables exist");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB or create tables:", err);
    process.exit(1);
  }
};

app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    res.json({ content: data[0].q, author: data[0].a });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

app.post("/api/favorites", authenticateToken, async (req, res) => {
  const { text, author } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "INSERT INTO favorites (text, author, user_id) VALUES ($1, $2, $3) RETURNING *",
      [text, author, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to save favorite", err);
    res.status(500).json({ error: "Failed to save favorite" });
  }
});

app.get("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await db.query("SELECT * FROM favorites WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error loading favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/favorites/:id", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const quoteId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING *",
      [quoteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quote not found or not yours" });
    }

    res.json({ message: "Quote deleted", deleted: result.rows[0] });
  } catch (err) {
    console.error("Failed to delete favorite", err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
});

init();