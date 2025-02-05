import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css'; 

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Inicio" },
    { path: "/aboutus", label: "Conócenos" },
    { path: "/ranking", label: "Ranking" },
    { path: "/plantations", label: "🌱Plantaciones🌱" },
    { path: "/knowmore", label: "Saber más!" },
    { path: "/characters", label: "Personajes" },
  ];

  return (
    <nav className="navbar">
      <ul>
        {navLinks
          .filter((link) => link.path !== location.pathname)
          .map((link) => (
            <li key={link.path}>
              <Link to={link.path}>{link.label}</Link>
            </li>
          ))}
        <li>
          <button className="logout-button" onClick={logout}>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
