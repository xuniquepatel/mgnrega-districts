import React from "react";

export default function Header({ title }: { title: string }) {
  return (
    <header className="app-header">
      <div className="brand">
        <img
          src="/mgnrega-logo.jpg"
          alt="MGNREGA"
          className="brand-logo"
          width={40}
          height={40}
        />
        <h1 className="brand-title">{title}</h1>
      </div>

      <div className="header-actions"></div>

      <div className="flag-bar">
        <span className="saffron" />
        <span className="white" />
        <span className="green" />
      </div>
    </header>
  );
}
