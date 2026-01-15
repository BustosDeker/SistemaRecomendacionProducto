// src/components/Navigation.jsx

import React from "react";
import { BarChart3, Activity } from "lucide-react";

const Navigation = ({ vistaActual, onCambiarVista }) => {
  const opciones = [
    { id: "catalogo", label: "Catálogo", icono: null },
    { id: "recomendaciones", label: "Recomendaciones IA", icono: null },
    { id: "historial", label: "Mis Compras", icono: null },
    { id: "graficas", label: "Gráficas", icono: BarChart3 },
    { id: "metricas", label: "Métricas", icono: Activity },
  ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-4">
        {opciones.map((opcion) => (
          <button
            key={opcion.id}
            onClick={() => onCambiarVista(opcion.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2 ${
              vistaActual === opcion.id
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {opcion.icono && <opcion.icono size={18} />}
            <span>{opcion.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
