import React from "react";

export default function Home() {
  return (
    <div className="container stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>
          Find your district’s MGNREGA performance
        </h2>
        <p style={{ color: "#5b6470", margin: "6px 0 0" }}>
          Pick your district or tap <b>Use my location</b>. You’ll see
          households worked, total person-days, average days per household, and
          women’s share. Simple numbers first, trends and comparisons next.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          Getting started: choose a district from the dropdown in the header
          area.
        </div>
        <div className="card">
          Tip: the app works offline — last viewed data stays available.
        </div>
      </div>
    </div>
  );
}
