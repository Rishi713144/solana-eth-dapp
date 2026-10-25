import React from 'react';
import logo from '../../assets/logo.svg';

export const Navbar = ({ onReset }) => (
  <nav className="w-full bg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 p-1.5">
           <img src={logo} alt="SikkaOne" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-lg tracking-tight">SikkaOne</span>
      </div>
    </div>
  </nav>
);


