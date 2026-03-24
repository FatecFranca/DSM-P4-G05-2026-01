import React, { useState } from "react";
import { API_URL } from "../config/api";
import "./GymGrid.css"

export default function Dashboard({ gyms = [], onGymRemoved }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleRemoveGym = async (gymId) => {
    if (!gymId) {
      alert("Invalid gym id.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this gym?")) return;

    const token = localStorage.getItem("token");
    setDeletingId(gymId);

    try {
      const res = await fetch(`${API_URL}/gyms/${gymId}`, {
        method: "DELETE",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to remove gym. ${text || res.statusText}`);
        setDeletingId(null);
        return;
      }

      onGymRemoved && onGymRemoved(gymId);
    } catch (err) {
      console.error(err);
      alert("Error removing gym.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="gym-grid">
      {gyms.map((g, idx) => {
        const id = g._id || g.id || idx;
        const occupancy = Number(g.occupancy || 0);
        const capacity = Number(g.capacity || 0) || 1;
        const percentage = Math.min(100, Math.round((occupancy / capacity) * 100));
        const isFull = occupancy >= capacity;
        const isHalf = occupancy >= capacity / 2;

        return (
          <div className="gym-card" key={id}>
            <div className="gym-card-header">
              <h3 className="gym-name">{g.name}</h3>
              <button
                className="gym-delete"
                onClick={() => handleRemoveGym(id)}
                disabled={deletingId === id}
                title="Delete gym"
              >
                {deletingId === id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="gym-stats">
              <div className="stat">
                <span className="label">Capacity</span>
                <span className="value">{capacity}</span>
              </div>
              <div className="stat">
                <span className="label">Occupancy</span>
                <span className="value">
                  {occupancy} / {capacity}
                </span>
              </div>
            </div>

            <div className="progress">
              <div
                className={`progress-bar${isFull ? " full" : isHalf ? " half" : ""}`}
                style={{ width: `${percentage}%` }}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            <div className="progress-info">
              {percentage}% occupied
              {isFull && <span className="full-badge">Full</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}