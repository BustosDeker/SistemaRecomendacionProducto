// src/utils/RedNeuronal.js

import { PRODUCTOS, CATEGORIAS } from './productos';

class RedNeuronalRecomendacion {
  constructor() {
    this.pesos = this.inicializarPesos();
    this.historialEntrenamiento = [];
    this.generacion = 0;
    this.tasaAprendizaje = 0.1;
  }

  inicializarPesos() {
    const pesos = {};
    CATEGORIAS.forEach(cat => {
      pesos[cat] = Math.random() * 0.5 + 0.5;
    });
    // Pesos adicionales para patrones de compra
    pesos.precioPromedio = 0;
    pesos.diversidad = 0.5;
    return pesos;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  calcularScore(producto, historialUsuario) {
    if (historialUsuario.length === 0) {
      return Math.random() * 0.3; // Score bajo inicial
    }

    let score = 0;
    
    // Factor 1: Categoría similar (peso adaptativo)
    const categoriasCompradas = historialUsuario.map(h => h.categoria);
    const frecuenciaCategoria = categoriasCompradas.filter(c => c === producto.categoria).length;
    const porcentajeCategoria = frecuenciaCategoria / historialUsuario.length;
    score += porcentajeCategoria * (this.pesos[producto.categoria] || 0.5) * 3;

    // Factor 2: Rango de precio similar (mejorado)
    const preciosComprados = historialUsuario.map(h => h.precio);
    const precioPromedio = preciosComprados.reduce((a, b) => a + b, 0) / preciosComprados.length;
    const precioMin = Math.min(...preciosComprados);
    const precioMax = Math.max(...preciosComprados);
    
    // Preferencia por productos en el rango de precio del usuario
    if (producto.precio >= precioMin && producto.precio <= precioMax * 1.2) {
      score += 1.5;
    }
    
    const diferenciaPrecio = Math.abs(producto.precio - precioPromedio) / (precioPromedio || 1);
    score += (1 - Math.min(diferenciaPrecio, 1)) * 2;

    // Factor 3: Tags compartidos (mejorado)
    const tagsComprados = new Set(historialUsuario.flatMap(h => h.tags));
    const tagsCompartidos = producto.tags.filter(tag => tagsComprados.has(tag)).length;
    const porcentajeTags = tagsCompartidos / producto.tags.length;
    score += porcentajeTags * 2.5;

    // Factor 4: Diversidad (evitar repetir productos muy similares)
    const productosCategoria = historialUsuario.filter(h => h.categoria === producto.categoria);
    if (productosCategoria.length > historialUsuario.length * 0.5) {
      score *= (1 - this.pesos.diversidad * 0.3);
    }

    // Factor 5: Tendencia temporal (productos recientes tienen más peso)
    const comprasRecientes = historialUsuario.slice(-3);
    const esCategoriaTendencia = comprasRecientes.some(h => h.categoria === producto.categoria);
    if (esCategoriaTendencia) {
      score += 1.2;
    }

    // Aplicar función de activación
    return this.sigmoid(score);
  }

  entrenar(historialUsuario) {
    if (historialUsuario.length === 0) return;

    this.generacion++;
    
    // Analizar patrones de compra
    const categoriasCompradas = historialUsuario.map(h => h.categoria);
    const frecuencias = {};
    
    categoriasCompradas.forEach(cat => {
      frecuencias[cat] = (frecuencias[cat] || 0) + 1;
    });

    // Ajustar pesos según frecuencia de compra
    Object.keys(frecuencias).forEach(cat => {
      const factor = frecuencias[cat] / historialUsuario.length;
      const ajuste = factor * this.tasaAprendizaje;
      
      // Incrementar peso de categorías populares
      this.pesos[cat] = Math.min(this.pesos[cat] + ajuste, 2.5);
      
      // Decrementar levemente otras categorías para balancear
      CATEGORIAS.forEach(otraCat => {
        if (otraCat !== cat && !frecuencias[otraCat]) {
          this.pesos[otraCat] = Math.max(this.pesos[otraCat] - ajuste * 0.1, 0.3);
        }
      });
    });

    // Calcular precio promedio del usuario
    const precios = historialUsuario.map(h => h.precio);
    this.pesos.precioPromedio = precios.reduce((a, b) => a + b, 0) / precios.length;

    // Ajustar diversidad según variedad de compras
    const categoriasUnicas = new Set(categoriasCompradas).size;
    this.pesos.diversidad = categoriasUnicas / CATEGORIAS.length;

    // Guardar en historial de entrenamiento
    this.historialEntrenamiento.push({
      generacion: this.generacion,
      numCompras: historialUsuario.length,
      pesos: { ...this.pesos },
      timestamp: Date.now()
    });
  }

  recomendar(historialUsuario, n = 6) {
    // Filtrar productos ya comprados
    const productosNoComprados = PRODUCTOS.filter(
      p => !historialUsuario.find(h => h.id === p.id)
    );

    // Calcular scores para todos los productos
    const recomendaciones = productosNoComprados.map(producto => ({
      ...producto,
      score: this.calcularScore(producto, historialUsuario),
      razon: this.obtenerRazonRecomendacion(producto, historialUsuario)
    }));

    // Ordenar por score
    const mejoresRecomendaciones = recomendaciones
      .sort((a, b) => b.score - a.score);

    // Aplicar diversidad: no recomendar solo de una categoría
    const recomendacionesBalanceadas = [];
    const categoriasUsadas = new Set();
    
    for (const rec of mejoresRecomendaciones) {
      // Siempre agregar si es de categoría nueva o ya tenemos pocas recomendaciones
      if (!categoriasUsadas.has(rec.categoria) || recomendacionesBalanceadas.length < 3) {
        recomendacionesBalanceadas.push(rec);
        categoriasUsadas.add(rec.categoria);
      } else if (recomendacionesBalanceadas.length < n) {
        // Agregar productos adicionales con un threshold mínimo de score
        if (rec.score > 0.4) {
          recomendacionesBalanceadas.push(rec);
        }
      }
      
      if (recomendacionesBalanceadas.length >= n) break;
    }

    // Si no hay suficientes, completar con las mejores opciones
    if (recomendacionesBalanceadas.length < n) {
      const faltantes = mejoresRecomendaciones
        .filter(r => !recomendacionesBalanceadas.find(rb => rb.id === r.id))
        .slice(0, n - recomendacionesBalanceadas.length);
      recomendacionesBalanceadas.push(...faltantes);
    }

    return recomendacionesBalanceadas.slice(0, n);
  }

  obtenerRazonRecomendacion(producto, historial) {
    if (historial.length === 0) return 'Producto popular';
    
    const categoriasCompradas = historial.map(h => h.categoria);
    const hayCategoria = categoriasCompradas.includes(producto.categoria);
    
    if (hayCategoria) {
      return `Basado en tus compras de ${producto.categoria}`;
    }
    
    const tagsComprados = new Set(historial.flatMap(h => h.tags));
    const tagsComunes = producto.tags.filter(tag => tagsComprados.has(tag));
    
    if (tagsComunes.length > 0) {
      return `Coincide con tus intereses: ${tagsComunes[0]}`;
    }
    
    return 'Recomendado para ti';
  }

  obtenerEstadisticas() {
    return {
      generacion: this.generacion,
      pesos: { ...this.pesos },
      historialEntrenamiento: this.historialEntrenamiento
    };
  }

  reiniciar() {
    this.pesos = this.inicializarPesos();
    this.historialEntrenamiento = [];
    this.generacion = 0;
  }
}

export default RedNeuronalRecomendacion;