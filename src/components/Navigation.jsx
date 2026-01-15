// src/components/Navigation.jsx

import React from 'react';

const Navigation = ({ vistaActual, onCambiarVista }) => {
  const opciones = [
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'recomendaciones', label: 'Recomendaciones IA' },
    { id: 'historial', label: 'Mis Compras' }
  ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-4">
        {opciones.map(opcion => (
          <button
            key={opcion.id}
            onClick={() => onCambiarVista(opcion.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              vistaActual === opcion.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opcion.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;