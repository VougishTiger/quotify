
const express= require("express");
const cors= require("cors");
const pool= require("./db");
require("dotenv").config();

const app= express();
app.use(cors());
app.use(express.json());

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

app.get("/api/favorites", async (req, res)=> {
  try{
    const reslut= await pool.query("SELECT * FROM favorites");
    res.json(result.rows);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: "Failed to fetch favorites"});
  }
});

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
