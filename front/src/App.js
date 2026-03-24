import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { API_URL } from './config/api';
import Home from "./components/Routes/Home";
import About from "./components/Routes/About";
import Contact from "./components/Routes/Contact";
import NavBar from "./components/navBar";
import Login from './components/login';
import Dashboard from './components/Routes/DashBoard';
import { authFetch } from './components/authFetch';
import './App.css';

function App() {
  const [gyms, setGyms] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));
  const [user, setUser] = useState("");

  const fetchGyms = async () => {
    try {
      const data = await authFetch(`${API_URL}/gyms`);
      setGyms(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
    } catch {
      setGyms([]);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGyms([]);
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    if (isAuthenticated) fetchGyms();
  }, [isAuthenticated]);

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUser(username);
    fetchGyms();
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="App">
      <Router>
        <NavBar onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home gyms={gyms} onRefreshGyms={fetchGyms} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;