// src/views/Historial.jsx

import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { EMOJI_CATEGORIAS } from '../utils/productos';

const ImagenProductoHistorial = ({ producto }) => {
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
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
        {EMOJI_CATEGORIAS[producto.categoria] || '📦'}
      </div>
    );
  }

  return (
    <img
      src={rutaImagen}
      alt={producto.nombre}
      className="w-20 h-20 object-contain rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-2 flex-shrink-0"
      onError={() => setImagenError(true)}
    />
  );
};

const Historial = ({ historialCompras }) => {
  // Calcular estadísticas
  const totalGastado = historialCompras.reduce((sum, p) => sum + p.precio, 0);
  const categoriasFrecuentes = historialCompras.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
    return acc;
  }, {});
  const categoriaFavorita = Object.entries(categoriasFrecuentes).sort((a, b) => b[1] - a[1])[0];
  const promedioCompra = historialCompras.length > 0 ? (totalGastado / historialCompras.length).toFixed(2) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Historial de Compras</h2>
        <p className="text-gray-600">Revisa todas tus compras anteriores</p>
      </div>
      
      {historialCompras.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg font-semibold mb-2">Aún no has realizado compras</p>
          <p className="text-gray-500 text-sm">Comienza a explorar nuestro catálogo</p>
        </div>
      ) : (
        <div>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart size={24} />
                <div className="text-right">
                  <p className="text-purple-100 text-xs">Total de compras</p>
                  <p className="text-3xl font-bold">{historialCompras.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} />
                <div className="text-right">
                  <p className="text-green-100 text-xs">Total gastado</p>
                  <p className="text-3xl font-bold">${totalGastado}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} />
                <div className="text-right">
                  <p className="text-blue-100 text-xs">Promedio por compra</p>
                  <p className="text-3xl font-bold">${promedioCompra}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categoría favorita */}
          {categoriaFavorita && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{EMOJI_CATEGORIAS[categoriaFavorita[0]] || '📦'}</div>
                <div>
                  <p className="text-sm text-gray-600">Tu categoría favorita</p>
                  <p className="text-lg font-bold text-purple-600">
                    {categoriaFavorita[0]} - {categoriaFavorita[1]} compra{categoriaFavorita[1] > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de compras */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Todas tus compras ({historialCompras.length})</h3>
            <div className="space-y-3">
              {historialCompras.map((producto, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg p-4 flex justify-between items-center hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <ImagenProductoHistorial producto={producto} />
                    <div>
                      <h3 className="font-bold text-gray-800">{producto.nombre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                          {producto.categoria}
                        </span>
                        <span className="text-xs text-gray-500">
                          Compra #{historialCompras.length - index}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {producto.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">${producto.precio}</span>
                    <p className="text-xs text-gray-500 mt-1">Compra exitosa</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Resumen total */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="mr-2" size={24} />
              Resumen de tu historial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Total de productos</p>
                <p className="text-3xl font-bold">{historialCompras.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Total invertido</p>
                <p className="text-3xl font-bold">${totalGastado}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Categorías diferentes</p>
                <p className="text-3xl font-bold">{Object.keys(categoriasFrecuentes).length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Promedio por compra</p>
                <p className="text-3xl font-bold">${promedioCompra}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;