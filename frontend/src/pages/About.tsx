import React from "react";

export default function About() {
  return (
    <div className="container stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>About this dashboard</h2>
        <p style={{ color: "#5b6470" }}>
          This site simplifies the monthly MGNREGA performance for each
          district. It stores data locally so you can view it even on poor
          networks, and it supports English, Hindi, and Gujarati with an audio
          summary.
        </p>
        <ul style={{ marginTop: 0, color: "#5b6470" }}>
          <li>Data source: data.gov.in Open API</li>
          <li>Backend: Node + PostgreSQL + Redis (cached ETL)</li>
          <li>Frontend: React + Vite (PWA, offline)</li>
        </ul>
      </div>
    </div>
  );
}
