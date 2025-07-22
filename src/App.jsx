import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [quote, setQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const getQuote = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/quote");
      setQuote(res.data);
    } catch (error) {
      console.error("Failed to fetch quote", error);
    }
  };

  const saveFavorite = async () => {
    if (!quote) return;
    try {
      await axios.post("http://localhost:5000/api/favorites", {
        text: quote.content,
        author: quote.author,
      });
      alert("Quote saved!");
    } catch (error) {
      console.error("Failed to save favorite", error);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/favorites");
      console.log("Favorites fetched:", res.data);
      setFavorites(res.data);
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  };
  const deleteFavorite= async (id)=> {
    try{
      await axios.delete(`http://localhost:5000/api/favorites/${id}`);
      loadFavorites();
    } catch(error) {
      console.error("Failed to delete favorite", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif", padding: "1rem" }}>
      <h1>Random Quote Generator</h1>
      <button onClick={getQuote}>Get Quote</button>

      {quote && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <p>"{quote.content}"</p>
          <p style={{ textAlign: "right", fontStyle: "italic" }}>— {quote.author}</p>
          <button onClick={saveFavorite}>Save to Favorites</button>
        </div>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <button onClick={loadFavorites}>View Favorites</button>

      <ul>
        {favorites.map((fav) => (
        <li key={fav.id} style={{ margin: "1rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>
        "{fav.text}" — <i>{fav.author}</i>
      </span>
      <button
        onClick={() => deleteFavorite(fav.id)}
        style={{ marginLeft: "1rem", padding: "0.25rem 0.5rem", background: "#f44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >Delete</button>
      </li>
        ))}
      </ul>
    </div>
  );
};

export default App;