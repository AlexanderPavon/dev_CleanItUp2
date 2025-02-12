import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Videofondo from "../assets/videos/videofondo2.mp4";
import medalGold from "../assets/images/numero1.webp";
import medalSilver from "../assets/images/numero2.png";
import medalBronze from "../assets/images/numero3.png";
import "../styles/Index.css";

const Index = () => {
  const { token, username, userId } = useAuth();
  const [playerRank, setPlayerRank] = useState(null);

  useEffect(() => {
    const checkRanking = async () => {
      if (token && userId) {
        try {
          const response = await fetch(`http://localhost:5000/api/game-data/stats/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          console.log('Datos recibidos:', data);
          
          // Guardar el ranking actual
          setPlayerRank(data?.ranking?.currentRanking || null);
          console.log('Ranking actual:', data?.ranking?.currentRanking);

        } catch (error) {
          console.error("Error al obtener el ranking:", error);
        }
      }
    };

    checkRanking();
  }, [token, userId]);

  const getMedalImage = (rank) => {
    switch (rank) {
      case 1:
        return { src: medalGold, alt: "Medalla de Oro" };
      case 2:
        return { src: medalSilver, alt: "Medalla de Plata" };
      case 3:
        return { src: medalBronze, alt: "Medalla de Bronce" };
      default:
        return null;
    }
  };

  const medalInfo = getMedalImage(playerRank);

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
              {medalInfo && (
                <img 
                  src={medalInfo.src}
                  alt={medalInfo.alt}
                  className="ranking-badge"
                  style={{
                    width: '50px',
                    height: '50px',
                    marginTop: '10px',
                    display: 'block',
                    margin: '10px auto'
                  }}
                  onLoad={() => console.log('Medalla cargada exitosamente')}
                />
              )}
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