import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Register.css"; 

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setError("❌ Las contraseñas no coinciden");
      return;
    }

    setError(""); // Limpiar error previo

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
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
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Registrarse</h2>

        {error && <p className="register-error">{error}</p>} 

        <form onSubmit={handleSubmit} className="register-form">
          {/* Correo */}
          <div className="register-input-wrapper">
            <i className="register-input-icon bi bi-envelope-at-fill"></i>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              required
            />
          </div>
          
          {/* Usuario */}
          <div className="register-input-wrapper">
            <i className="register-input-icon bi bi-person-fill"></i>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="register-input"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="register-input-wrapper">
            <i className="register-input-icon bi bi-lock-fill"></i>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
            >
              <i className={`bi ${showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"}`}></i>
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="register-input-wrapper">
            <i className="register-input-icon bi bi-lock-fill"></i>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="register-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-btn"
            >
              <i className={`bi ${showConfirmPassword ? "bi-eye-fill" : "bi-eye-slash-fill"}`}></i>
            </button>
          </div>

          <button type="submit" className="register-button">
            Registrarse
          </button>

          <div className="register-footer">
            <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
