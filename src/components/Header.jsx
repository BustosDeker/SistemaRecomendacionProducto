// src/components/Header.jsx

import React from 'react';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Header = ({ usuarioActual, carritoCount, onVerCarrito, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="text-purple-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">TechStore AI</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-lg">
            <User size={20} className="text-purple-600" />
            <span className="font-semibold text-purple-800">{usuarioActual}</span>
          </div>
          
          <button
            onClick={onVerCarrito}
            className="relative p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
          >
            <ShoppingCart size={24} className="text-blue-600" />
            {carritoCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {carritoCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;