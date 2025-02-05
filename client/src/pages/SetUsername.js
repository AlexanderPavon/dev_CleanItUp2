import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SetUsername.css";

const SetUsername = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      login(data.token); 
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="set-username-page">
      <div className="set-username-card">
        <h2 className="set-username-title">Ingresa tu nombre de usuario</h2>

        {error && <p className="set-username-error">{error}</p>}

        <form onSubmit={handleSubmit} className="set-username-form">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Guardar y continuar</button>
        </form>
      </div>
    </div>
  );
};

export default SetUsername;
