
const express= require("express");
const cors= require("cors");
const pool= require("./db");
require("dotenv").config();

const app= express();
app.use(cors());
app.use(express.json());

const PORT= process.env.PORT || 5000;

const init = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT
      )
    `);

    console.log("✅ Connected to DB and ensured favorites table exists");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect to DB or create table:", err);
    process.exit(1); // stop app if DB fails
  }
};

app.get("/api/quote", async(req, res)=> {
  console.log("Quote requested");
  try {
    const response =await fetch("https://zenquotes.io/api/random");
    const data= await response.json();
    res.json({content: data[0].q, author: data[0].a});
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error:"Failed to fetch quote"});
  }
});

app.post("/api/favorites", async(req, res)=> {
  const {text, author}= req.body;
  console.log("Saving favorite:", text, author);
  try{
    const result= await pool.query(
      "INSERT INTO favorites (text, author) VALUES ($1,$2) RETURNING*",
      [text, author] 
    );
    res.json(result.rows[0]);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: "Failed to save favorite"});
  }
});

app.get("/api/favorites", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM favorites ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load favorites", err);
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

app.delete("/api/favorites/:id", async(req,res)=> {
  const {id}= req.params;

  try{
    const result= await pool.query("DELETE FROM favorites WHERE id= $1 RETURNING *",[id]);
    if (result.rows.length===0){
      return res.status(404).json({error: "Quote not found"});
    }
    res.json({message: "Quote Deleted", deleted: result.rows[0] });
  } catch(err) {
    console.error("Failed to delete favorite", err);
    res.status(500).json({error:"Failed to delete Favorite"});
  }
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
init();