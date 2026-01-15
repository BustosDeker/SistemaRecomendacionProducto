// src/views/Carrito.jsx

import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { EMOJI_CATEGORIAS } from '../utils/productos';

const ImagenProducto = ({ producto }) => {
  const [imagenError, setImagenError] = useState(false);

  const obtenerRutaImagen = () => {
    try {
      return new URL(`../img/${producto.imagen}`, import.meta.url).href;
    } catch (error) {
      return null;
    }
  };

  const rutaImagen = obtenerRutaImagen();

  if (!rutaImagen || imagenError) {
    return (
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-3xl">
        {EMOJI_CATEGORIAS[producto.categoria] || '📦'}
      </div>
    );
  }

  return (
    <img
      src={rutaImagen}
      alt={producto.nombre}
      className="w-20 h-20 object-contain rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-2"
      onError={() => setImagenError(true)}
    />
  );
};

const Carrito = ({ carrito, onRemoverDelCarrito, onFinalizarCompra }) => {
  const total = carrito.reduce((sum, p) => sum + p.precio, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Carrito de Compras</h2>
      
      {carrito.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Tu carrito está vacío</p>
        </div>
      ) : (
        <div>
          <div className="space-y-4 mb-6">
            {carrito.map((producto, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-md transition">
                <div className="flex items-center space-x-4">
                  <ImagenProducto producto={producto} />
                  <div>
                    <h3 className="font-bold text-gray-800">{producto.nombre}</h3>
                    <p className="text-sm text-gray-600">{producto.categoria}</p>
                    <div className="flex gap-1 mt-1">
                      {producto.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-gray-800">${producto.precio}</span>
                  <button
                    onClick={() => onRemoverDelCarrito(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-600">
                <span>Productos ({carrito.length}):</span>
                <span className="font-semibold">${total}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Envío:</span>
                <span className="font-semibold text-green-600">GRATIS</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-3xl font-bold text-purple-600">${total}</span>
              </div>
            </div>
            
            <button
              onClick={onFinalizarCompra}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-md hover:shadow-lg"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;