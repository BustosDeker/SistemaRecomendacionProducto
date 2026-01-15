// src/views/Login.jsx

import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Login = ({ 
  formLogin, 
  setFormLogin, 
  modoRegistro, 
  setModoRegistro, 
  onLogin 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <ShoppingCart className="mx-auto mb-4 text-purple-600" size={48} />
          <h1 className="text-3xl font-bold text-gray-800">
            {modoRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-600 mt-2">Sistema de Recomendación Inteligente</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formLogin.username}
            onChange={(e) => setFormLogin({ ...formLogin, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formLogin.password}
            onChange={(e) => setFormLogin({ ...formLogin, password: e.target.value })}
          />
          
          <button
            onClick={onLogin}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            {modoRegistro ? 'Registrarse' : 'Iniciar Sesión'}
          </button>

          <button
            onClick={() => setModoRegistro(!modoRegistro)}
            className="w-full text-purple-600 hover:text-purple-700 transition"
          >
            {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;