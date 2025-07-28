import React, { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./auth";
import { jwtDecode } from "jwt-decode";

const App = () => {
  const [quote, setQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
   if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      console.log("Decoded user from token:", decoded);
    } catch (err) {
      console.error("Invalid token", err);
      setUser(null);
    }
  } else {
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }
  }, [token]);

  const getQuote = async () => {
    const res = await axios.get("http://localhost:5000/api/quote");
    setQuote(res.data);
  };

  const saveFavorite = async () => {
    if (!quote || !quote.content) {
    alert("No quote loaded to save!");
    return;
  }

  try {
    console.log("Saving this quote:", quote);
    console.log("Sending to backend:", {
      text: quote.content,
      author: quote.author || "Unknown"
    });

    await axios.post("http://localhost:5000/api/favorites", {
      text: quote.content,
      author: quote.author || "Unknown"
    });

    alert("Favorite saved!");
  } catch (error) {
    console.error("Error saving favorite:", error.response?.data || error.message);
  }
  };

  const loadFavorites = async () => {
     try {
    console.log("Loading favorites...");
    const res = await axios.get("http://localhost:5000/api/favorites");
    console.log("Favorites received:", res.data);
    setFavorites(res.data);
  } catch (err) {
    console.error("Error loading favorites:", err.response?.data || err.message);
  }
  };

  const deleteFavorite = async (id) => {
    await axios.delete(`http://localhost:5000/api/favorites/${id}`);
    loadFavorites();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setFavorites([]);
  };

  if (!token || !user) {
    return <Auth setUser={setUser} setToken={setToken} />;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Welcome, {user.name}</h2>
      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Random Quote Generator</h3>
      <button onClick={getQuote}>Get Quote</button>

      {quote && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <p>"{quote.content}"</p>
          <p style={{ textAlign: "right" }}>— {quote.author}</p>
          <button onClick={saveFavorite}>Save to Favorites</button>
        </div>
      )}

      <hr />

      <button onClick={loadFavorites}>View My Favorites</button>

      <ul>
        {favorites.map((fav) => (
          <li key={fav.id}>
            "{fav.text}" — <i>{fav.author}</i>
            <button onClick={() => deleteFavorite(fav.id)} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;