import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  const base =
    "text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white";
  const active = "text-white";
  return (
    <nav className="sticky top-0 z-50 -mx-6 mb-10 border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.4em] text-white/70">
          QueryAtlas
        </div>
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) => `${base} ${isActive ? active : ""}`}
          >
            App
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `${base} ${isActive ? active : ""}`}
          >
            About
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
