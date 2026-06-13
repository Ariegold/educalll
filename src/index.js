/**
 * EduCall — Entry Point
 * Mounts the React app into #root.
 * AuthProvider wraps everything so auth state is available app-wide.
 * AppRouter handles page-level routing.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
