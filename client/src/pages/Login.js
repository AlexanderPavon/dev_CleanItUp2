import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "../firebaseConfig";
import "../styles/Login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Puede ser email o username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      login(data.token, data.user.id, data.user.username); 
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      const response = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, username: user.displayName }),
      });
  
      const data = await response.json();
  
      if (data.requiresUsername) {
        navigate("/set-username", { state: { email: data.email } });
      } else if (response.ok) {
        login(data.token, data.user.id, data.user.username); 
        navigate("/");
      } else {
        setError(data.message);
      }
    }
  };
  
  


  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de identificador (email o usuario) */}
          <div className="login-input-wrapper">
            <i className="login-input-icon bi bi-person-fill"></i>
            <input
              type="text"
              placeholder="Correo o Nombre de Usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Campo de contraseña */}
          <div className="login-input-wrapper">
            <i className="login-input-icon bi bi-lock-fill"></i>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
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

          {/* Botón principal */}
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>

          {/* Botón de Google */}
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <i className="bi bi-google"></i> Iniciar sesión con Google
          </button>

          <div className="login-footer">
            <a href="/register">¿No tienes cuenta? Registrarse</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
