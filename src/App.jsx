import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [quote, setQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  const fetchQuote = async () => {
    try {
      const res = await axios.get(`${API}/api/quote`);
      setQuote(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You must log in first");
      const res = await axios.post(
        `${API}/api/favorites`,
        quote,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites([...favorites, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(`${API}/api/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchFavorites();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="container">
      <h1>Quotify</h1>
      {quote && (
        <div className="quote">
          <p>"{quote.content}"</p>
          <h4>- {quote.author}</h4>
          <button onClick={saveFavorite}>❤️ Save</button>
          <button onClick={fetchQuote}>🔄 New Quote</button>
        </div>
      )}

      <h2>Favorites</h2>
      <ul>
        {favorites.map((f) => (
          <li key={f.id}>
            "{f.text}" - {f.author}
            <button onClick={() => deleteFavorite(f.id)}>🗑️ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;