import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Ranking.module.css";

const Ranking = () => {
  const [rankingData, setRankingData] = useState([]);

  // Obtener los datos de ranking del backend
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/game-data/top-scores");
        if (!response.ok) {
          throw new Error("Error al obtener el ranking");
        }
        const data = await response.json();
        setRankingData(data);
      } catch (error) {
        console.error("Error al obtener el ranking:", error);
      }
    };

    fetchRanking();
  }, []);

  return (
    <>
      <Navbar />
      <section className="section">
        <div className="card">
          <h1>Ranking</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>{player.username}</td>
                  <td>{player.bestScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Ranking;
