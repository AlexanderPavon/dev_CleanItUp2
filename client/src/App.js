import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider,useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Index from './pages/Index'
import AboutUs from './pages/AboutUs';
import Ranking from './pages/Ranking';
import Plantations from './pages/Plantations';
import KnowMore from './pages/KnowMore';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Characters from './pages/Characters';
import SetUsername from './pages/SetUsername'


// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

function App() {

  return (
      <AuthProvider>
          <Router>
              <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/aboutus" element={<PrivateRoute><AboutUs /></PrivateRoute>} />
                  <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
                  <Route path="/plantations" element={<PrivateRoute><Plantations /></PrivateRoute>} />
                  <Route path="/knowmore" element={<PrivateRoute><KnowMore /></PrivateRoute>} />
                  <Route path="/game" element={<PrivateRoute><Game/></PrivateRoute>} />
                  <Route path="/characters" element={<PrivateRoute><Characters/></PrivateRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/set-username" element={<SetUsername />} />
              </Routes>
          </Router>
      </AuthProvider>
  );
}


export default App;
