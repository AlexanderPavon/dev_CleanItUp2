import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/AboutUs.css'; 

const AboutUs = () => {
  return (
    <div>
      <Navbar />
      <section className="section">
        <div className="card">
          <h1>Conócenos</h1>
          <p>
            Somos un equipo conformado por 3 desarrolladores: Alexander, Jeremy y Michael. 
            Nuestro objetivo es crear conciencia sobre la importancia de cuidar el planeta 
            a través de experiencias interactivas.
          </p>
          <h2>Nuestras Metas</h2>
          <ul>
            <li>Fomentar la reforestación</li>
            <li>Concientizar sobre el impacto de los desechos</li>
            <li>Incentivar la acción individual para el cambio global</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;