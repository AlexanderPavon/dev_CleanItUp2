import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
// Comentar React.StrictMode para evitar el doble render en desarrollo
//   <React.StrictMode>
    <App />
//   </React.StrictMode>
);

reportWebVitals();