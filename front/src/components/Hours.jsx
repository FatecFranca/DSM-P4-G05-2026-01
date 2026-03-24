import React from "react";
import "./hours.css";

export default function Footer({gym}) {
  return (
    <div className="hours">
      <h3>best hours for {gym}</h3>
      <p> 6:00 - 8:00 || 20:00 - 22:00</p>
      <p> 6:00 - 8:00 || 20:00 - 22:00</p>
      <p> 6:00 - 8:00 || 20:00 - 22:00</p>
    </div>
  );
}