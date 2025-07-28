const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const SECRET = process.env.JWT_SECRET || "supersecretkey";
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
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT,
        user_id INTEGER REFERENCES users(id)
      )
    `);

    console.log("✅ Connected to DB and ensured favorites table exists");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB or create table:", err);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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

app.get("/api/favorites", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "supersecretkey", async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    try {
      const userId = decoded.userId;
      const result = await db.query("SELECT * FROM favorites WHERE user_id = $1", [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error loading favorites:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
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

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json(user.rows[0]);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Email already in use or registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

 
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

init();