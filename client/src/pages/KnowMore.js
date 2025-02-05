import React from 'react';
import Navbar from '../components/Navbar';

const KnowMore = () => {
  return (
    <div>
      <Navbar />
      <section className="section">
        <h1>Saber Más</h1>
        <h2>Problemas ambientales actuales</h2>
        <div className="cards-container">
          <div className="card">
            <h3>Deforestación acelerada</h3>
            <p>La deforestación está contribuyendo al cambio climático y la pérdida de biodiversidad. 
               Cada año, millones de hectáreas de bosques desaparecen, afectando la vida silvestre y 
               alterando el equilibrio de los ecosistemas.</p>
          </div>
          <div className="card">
            <h3>Especies en peligro de extinción</h3>
            <p>Muchas especies de animales, como el oso polar y el tigre de Bengala, están en peligro 
               de extinción debido a la caza furtiva y la destrucción de su hábitat natural, lo que 
               amenaza la biodiversidad del planeta.</p>
          </div>
          <div className="card">
            <h3>Contaminación plástica</h3>
            <p>Los plásticos contaminan los océanos, matando a miles de especies marinas cada año. 
               El uso excesivo de plásticos de un solo uso es una de las principales causas de la 
               contaminación ambiental.</p>
          </div>
          <div className="card">
            <h3>Calentamiento global</h3>
            <p>El aumento de la temperatura global debido a la actividad humana está alterando los 
               patrones climáticos, afectando a las comunidades y especies que dependen de un clima 
               estable para sobrevivir.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowMore;