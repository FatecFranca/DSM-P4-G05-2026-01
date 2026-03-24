import React, { useMemo, useState } from 'react';
import { API_URL } from '../config/api';
import { authFetch } from './authFetch';
import { jwtDecode } from 'jwt-decode';
import './inputClients.css';

const DEFAULT_GYM_NAME = 'Exprime';

export default function Inputs({ onClientAdded, onClientDeleted, username }) {
  const [gymName, setGymName] = useState(DEFAULT_GYM_NAME);
  const [message, setMessage] = useState('');

  const displayName = useMemo(() => {
    if (username && username.trim()) return username;
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const decoded = jwtDecode(token);
      return decoded?.username || decoded?.name || decoded?.sub || '';
    } catch {
      return '';
    }
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { gymName: (gymName || '').trim() };
    if (!payload.gymName) {
      setMessage('Gym name is required.');
      return;
    }
    try {
      await authFetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage('Checked in successfully!');
      onClientAdded && onClientAdded();
    } catch (err) {
      setMessage('Check-in failed: ' + (err.message || 'error'));
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const payload = { gymName: (gymName || '').trim() };
    if (!payload.gymName) {
      setMessage('Gym name is required.');
      return;
    }
    try {
      await authFetch(`${API_URL}/clients/checkout`, {
        method: 'POST',
        body:  JSON.stringify(payload),
      });
      setMessage('Checked out successfully!');
      onClientDeleted && onClientDeleted();
    } catch (err) {
      setMessage('Check-out failed: ' + (err.message || 'error'));
    }
  };

  return (
    <form className="client-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
      <div className="client">
        <div className="client-inputs">
          <h3>Welcome, {displayName || 'User'}</h3>
          <input
            type="text"
            id="gymName"
            placeholder="Gym name"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
          />
          <button type="submit" className="client-button">Check In</button>
          <button type="button" className="client-checkOut" onClick={handleDelete}>Check out</button>
          {message && <div className="client-message">{message}</div>}
        </div>
      </div>
    </form>
  );
}