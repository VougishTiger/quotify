import React, { useState } from "react";
import axios from "axios";

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";

      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password
          };

      const res = await axios.post(url, body);
      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token); 
    } catch (err) {
      console.error("Auth failed", err);
      alert("Authentication failed. Check your info and try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </>
        )}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: "1rem" }}>
        {isLogin ? "Need to create an account?" : "Already have an account?"}
      </button>
    </div>
  );
};

export default Auth;