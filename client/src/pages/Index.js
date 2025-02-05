import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Videofondo from "../assets/videos/videofondo2.mp4";
import "../styles/Index.css";

const Index = () => {
  const { token, username } = useAuth();

  return (
    <div>
      <section className="banner" id="inicio">
        <div className="video-container">
          <video autoPlay muted loop playsInline className="bg-video">
            <source src={Videofondo} type="video/mp4" />
            Tu navegador no soporta videos HTML5.
          </video>
        </div>

        <div className="banner-content">
          {token && <Navbar />}
          
          <h1>Clean It Up!</h1>

          {token ? (
            <>
              {username && <h2 className="welcome-text">Hola, {username}!</h2>}
              <Link to="/game" className="btn">Jugar</Link>
            </>
          ) : (
            <div>
              <Link to="/login" className="btn">Iniciar Sesión</Link>
              <Link to="/register" className="btn">Registrarse</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
