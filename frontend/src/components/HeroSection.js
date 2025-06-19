// src/components/HeroSection.jsx
import React from "react";
import "./HeroSection.css";

export default function HeroSection() {
  return (
    <div
      className="hero-section"
      style={{
        background: "url('/assets/hero.jpg') no-repeat center center/cover",
      }}
    >
      <div className="hero-content">
        <h1>Discover Stunning Photos</h1>
        <p>Buy premium images or download from our free gallery – all in one place.</p>
        <div className="hero-buttons">
          <button className="btn-primary">Explore Premium</button>
          <button className="btn-secondary">Browse Free</button>
        </div>
      </div>
    </div>
  );
}
