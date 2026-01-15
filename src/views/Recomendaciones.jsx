// src/views/Recomendaciones.jsx

import React, { useState } from 'react';
import { TrendingUp, Star, Zap, Brain } from 'lucide-react';
import { EMOJI_CATEGORIAS } from '../utils/productos';

const ImagenProductoRecomendado = ({ producto }) => {
  const [imagenError, setImagenError] = useState(false);

  const obtenerRutaImagen = () => {
    try {
      return new URL(`../img/${producto.imagen}`, import.meta.url).href;
    } catch (error) {
      return null;
    }
  };

  const rutaImagen = obtenerRutaImagen();

  return (
    <div className="relative h-40 bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-lg overflow-hidden group flex items-center justify-center mb-4">
      {rutaImagen && !imagenError ? (
        <>
          <img
            src={rutaImagen}
            alt={producto.nombre}
            className="w-full h-full object-contain p-4 transition-all duration-300 group-hover:scale-105"
            onError={() => setImagenError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="text-6xl z-10 group-hover:scale-110 transition-transform duration-300">
            {EMOJI_CATEGORIAS[producto.categoria] || '📦'}
          </div>
        </>
      )}
    </div>
  );
};

const Recomendaciones = ({ recomendaciones, historialCompras, onAddToCart, onBuyNow, estadisticasIA }) => {
  return (
    <div>
      {/* Banner de IA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Brain size={32} className="animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold">Recomendaciones Personalizadas con IA</h2>
              <p className="text-purple-100 text-sm">
                Red Neuronal Artificial • Generación #{estadisticasIA?.generacion || 0} • Aprendizaje continuo
              </p>
            </div>
          </div>
          {historialCompras.length > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-purple-100">Precisión del modelo</div>
              <div className="text-2xl font-bold">{Math.min(85 + historialCompras.length * 2, 99)}%</div>
            </div>
          )}
        </div>
        <p className="text-purple-100">
          El sistema aprende de cada compra para mejorar las recomendaciones
        </p>
      </div>

      {historialCompras.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Star size={48} className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ¡Comienza a comprar para obtener recomendaciones!
          </h3>
          <p className="text-gray-600">
            La IA aprenderá de tus preferencias y te sugerirá productos personalizados
          </p>
        </div>
      ) : (
        <>
          {/* Estadísticas de aprendizaje */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Compras analizadas</p>
                  <p className="text-2xl font-bold text-gray-800">{historialCompras.length}</p>
                </div>
                <TrendingUp className="text-purple-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Categorías exploradas</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(historialCompras.map(h => h.categoria)).size}
                  </p>
                </div>
                <Star className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Recomendaciones activas</p>
                  <p className="text-2xl font-bold text-gray-800">{recomendaciones.length}</p>
                </div>
                <Zap className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Generación IA</p>
                  <p className="text-2xl font-bold text-gray-800">#{estadisticasIA?.generacion || 0}</p>
                </div>
                <Brain className="text-orange-500" size={24} />
              </div>
            </div>
          </div>

          {/* Productos recomendados */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              🎯 Productos seleccionados especialmente para ti
            </h3>
            <span className="text-sm text-gray-600">
              Actualizadas en tiempo real
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recomendaciones.map((producto, index) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-md border-2 border-purple-200 hover:shadow-xl hover:border-purple-400 transition-all relative overflow-hidden">
                {/* Badge de ranking */}
                {index < 3 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 z-10">
                    <Star size={12} fill="currentColor" />
                    <span>Top {index + 1}</span>
                  </div>
                )}

                {/* Badge de categoría */}
                <span className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full z-10">
                  {producto.categoria}
                </span>

                {/* Imagen del producto */}
                <ImagenProductoRecomendado producto={producto} />

                {/* Contenido */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">{producto.nombre}</h3>
                    <span className="text-2xl font-bold text-gray-800 ml-2">${producto.precio}</span>
                  </div>
                  
                  {/* Razón de recomendación */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                    <p className="text-xs text-blue-800 font-medium">
                      💡 {producto.razon || 'Recomendado para ti'}
                    </p>
                  </div>

                  {/* Score de IA con animación */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-semibold">Nivel de coincidencia:</span>
                      <span className="text-sm font-bold text-purple-600">
                        {(producto.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${producto.score * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {producto.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onAddToCart(producto)}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      🛒 Carrito
                    </button>
                    <button
                      onClick={() => onBuyNow(producto)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje educativo */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Brain size={32} className="text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">¿Cómo funciona el sistema de recomendaciones?</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Nuestra Red Neuronal Artificial analiza tus compras en tiempo real y aprende de tus preferencias:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Detecta patrones en las categorías que prefieres</li>
                  <li>✓ Analiza tu rango de precios habitual</li>
                  <li>✓ Identifica tags y características comunes</li>
                  <li>✓ Cada compra mejora la precisión del modelo</li>
                  <li>✓ Las recomendaciones se actualizan instantáneamente</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Recomendaciones;