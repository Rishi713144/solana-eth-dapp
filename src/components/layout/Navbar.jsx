import React from 'react';
import logo from '../../assets/logo.svg';

export const Navbar = ({ onReset }) => (
  <nav className="navbar">
    <div className="nav-container">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
        <div className="logo-icon overflow-hidden">
           <img src={logo} alt="SikkaOne" className="w-full h-full object-cover" />
        </div>
        <span className="logo-text">SikkaOne</span>
      </div>

    </div>
  </nav>
);


