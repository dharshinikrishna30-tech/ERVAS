import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Farmer from './pages/Farmer';
import Processing from './pages/Processing';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer" element={<Farmer />} />
        <Route path="/processing" element={<Processing />} />
      </Routes>
    </Router>
  );
}

export default App;