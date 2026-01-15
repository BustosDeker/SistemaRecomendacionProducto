// src/views/Metricas.jsx

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Target,
  TrendingUp,
  Award,
  Brain,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
} from "lucide-react";

const Metricas = ({ historialCompras, recomendaciones, estadisticasIA }) => {
  // Calcular métricas de evaluación del modelo
  const metricas = useMemo(() => {
    if (historialCompras.length < 2) {
      return null;
    }

    // 1. PRECISION@K: Mide qué tan relevantes son las recomendaciones basándose en similitud
    // Se calcula viendo cuántas recomendaciones comparten categoría Y tags con compras recientes
    const ultimasCompras = historialCompras.slice(-5);
    const categoriasRecientes = ultimasCompras.map((c) => c.categoria);
    const tagsRecientes = new Set(ultimasCompras.flatMap((c) => c.tags));

    let puntajeRelevancia = 0;
    recomendaciones.slice(0, 6).forEach((rec) => {
      let puntos = 0;
      // Punto por categoría coincidente
      if (categoriasRecientes.includes(rec.categoria)) {
        puntos += 0.5;
      }
      // Punto por tags coincidentes
      const tagsCoincidentes = rec.tags.filter((tag) =>
        tagsRecientes.has(tag)
      ).length;
      if (tagsCoincidentes > 0) {
        puntos += 0.5;
      }
      puntajeRelevancia += puntos;
    });

    const precisionAtK =
      recomendaciones.length > 0
        ? (puntajeRelevancia / Math.min(recomendaciones.length, 6)) * 100
        : 0;

    // 2. HIT RATE: Tasa de aciertos basada en scores de recomendaciones
    // Consideramos aciertos las recomendaciones con score > promedio
    const scorePromedio =
      recomendaciones.length > 0
        ? recomendaciones.reduce((sum, r) => sum + (r.score || 0), 0) /
          recomendaciones.length
        : 0;

    // Umbral dinámico: usar el 70% del score promedio, mínimo 0.2
    const umbral = Math.max(scorePromedio * 0.7, 0.2);
    const recomendacionesAltas = recomendaciones.filter(
      (r) => (r.score || 0) > umbral
    ).length;

    const hitRate =
      recomendaciones.length > 0
        ? (recomendacionesAltas / recomendaciones.length) * 100
        : 0;

    // 3. DIVERSIDAD: Variedad de categorías en recomendaciones
    const categoriasRec = new Set(recomendaciones.map((r) => r.categoria));
    const diversidad =
      recomendaciones.length > 0 ? (categoriasRec.size / 7) * 100 : 0; // 7 categorías totales

    // 4. RELEVANCIA: Similitud entre recomendaciones y compras recientes
    const categoriasCompradas = historialCompras
      .slice(-10)
      .map((c) => c.categoria);
    const recRelevantes = recomendaciones.filter((r) =>
      categoriasCompradas.includes(r.categoria)
    ).length;
    const relevancia =
      recomendaciones.length > 0
        ? (recRelevantes / recomendaciones.length) * 100
        : 0;

    // 5. ACCURACY DEL MODELO (basado en el loss)
    const lossActual =
      estadisticasIA?.historialEntrenamiento?.slice(-1)[0]?.loss || 1;
    const accuracy = Math.max(0, Math.min(100, (1 - lossActual) * 100));

    // 6. SCORE PROMEDIO DE RECOMENDACIONES (ya calculado arriba, solo convertir a %)
    const scorePromedioDisplay = scorePromedio * 100;

    // 7. EVOLUCIÓN DEL LOSS (últimas 5 generaciones)
    const evolucionLoss =
      estadisticasIA?.historialEntrenamiento?.slice(-5).map((h, idx) => ({
        generacion: `Gen ${h.generacion}`,
        loss: (h.loss * 100).toFixed(2),
        compras: h.numCompras,
      })) || [];

    // 8. COBERTURA: Porcentaje de categorías cubiertas por recomendaciones
    const cobertura = (categoriasRec.size / 7) * 100;

    // 9. NOVEDAD: Productos recomendados que no son de la categoría más comprada
    const categoriaFavorita = [
      ...historialCompras.reduce((acc, c) => {
        acc.set(c.categoria, (acc.get(c.categoria) || 0) + 1);
        return acc;
      }, new Map()),
    ].sort((a, b) => b[1] - a[1])[0]?.[0];

    const recNovedosas = recomendaciones.filter(
      (r) => r.categoria !== categoriaFavorita
    ).length;
    const novedad =
      recomendaciones.length > 0
        ? (recNovedosas / recomendaciones.length) * 100
        : 0;

    // 10. CONFIANZA DEL MODELO: Diferencia entre el score más alto y más bajo
    const scores = recomendaciones.map((r) => r.score || 0);
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 1);
    const confianza =
      maxScore > 0 ? ((maxScore - minScore) / maxScore) * 100 : 0;

    // Calcular aciertos para mostrar: recomendaciones con score alto
    const aciertos = recomendacionesAltas;

    return {
      precisionAtK: precisionAtK.toFixed(1),
      hitRate: hitRate.toFixed(1),
      diversidad: diversidad.toFixed(1),
      relevancia: relevancia.toFixed(1),
      accuracy: accuracy.toFixed(1),
      scorePromedio: scorePromedioDisplay.toFixed(1),
      evolucionLoss,
      cobertura: cobertura.toFixed(1),
      novedad: novedad.toFixed(1),
      confianza: confianza.toFixed(1),
      totalRecomendaciones: recomendaciones.length,
      aciertos,
    };
  }, [historialCompras, recomendaciones, estadisticasIA]);

  // Datos para el radar chart
  const datosRadar = metricas
    ? [
        {
          metrica: "Precisión",
          valor: parseFloat(metricas.precisionAtK),
          fullMark: 100,
        },
        {
          metrica: "Relevancia",
          valor: parseFloat(metricas.relevancia),
          fullMark: 100,
        },
        {
          metrica: "Diversidad",
          valor: parseFloat(metricas.diversidad),
          fullMark: 100,
        },
        {
          metrica: "Novedad",
          valor: parseFloat(metricas.novedad),
          fullMark: 100,
        },
        {
          metrica: "Cobertura",
          valor: parseFloat(metricas.cobertura),
          fullMark: 100,
        },
        {
          metrica: "Accuracy",
          valor: parseFloat(metricas.accuracy),
          fullMark: 100,
        },
      ]
    : [];

  // Componente de tarjeta de métrica
  const TarjetaMetrica = ({
    icono: Icono,
    titulo,
    valor,
    maxValor = 100,
    color,
    descripcion,
    sufijo = "%",
  }) => {
    const porcentaje = (valor / maxValor) * 100;
    const isGood = porcentaje >= 70;
    const isMedium = porcentaje >= 40 && porcentaje < 70;

    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${color}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-full ${color
                .replace("border-", "bg-")
                .replace("600", "100")}`}
            >
              <Icono className={color.replace("border-", "text-")} size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{titulo}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {valor}
                {sufijo}
              </p>
            </div>
          </div>
          <div>
            {isGood && <CheckCircle className="text-green-500" size={24} />}
            {isMedium && <AlertCircle className="text-yellow-500" size={24} />}
            {!isGood && !isMedium && (
              <AlertCircle className="text-red-500" size={24} />
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${
              isGood
                ? "bg-green-500"
                : isMedium
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-500">{descripcion}</p>
      </div>
    );
  };

  if (!metricas) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <Activity size={64} className="mx-auto mb-4 text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Datos Insuficientes
        </h3>
        <p className="text-gray-600">
          Necesitas al menos 2 compras para evaluar las métricas del modelo de
          IA.
          <br />
          Continúa comprando productos para ver el análisis de rendimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity size={40} />
            <div>
              <h2 className="text-3xl font-bold">
                Métricas de Evaluación del Modelo
              </h2>
              <p className="text-indigo-100">
                Análisis del rendimiento de la Red Neuronal con TensorFlow.js
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-xs text-indigo-100">Generación</div>
            <div className="text-2xl font-bold">
              #{estadisticasIA?.generacion || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Brain className="mr-2" size={24} />
          Estado del Modelo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-90">Recomendaciones Activas</div>
            <div className="text-3xl font-bold">
              {metricas.totalRecomendaciones}
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-90">Aciertos Detectados</div>
            <div className="text-3xl font-bold">{metricas.aciertos}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-90">Score Promedio</div>
            <div className="text-3xl font-bold">{metricas.scorePromedio}%</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm opacity-90">Confianza</div>
            <div className="text-3xl font-bold">{metricas.confianza}%</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TarjetaMetrica
          icono={Target}
          titulo="Precision@K"
          valor={metricas.precisionAtK}
          color="border-purple-600"
          descripcion="Relevancia de recomendaciones basada en categorías y tags"
        />
        <TarjetaMetrica
          icono={CheckCircle}
          titulo="Hit Rate"
          valor={metricas.hitRate}
          color="border-green-600"
          descripcion="Porcentaje de recomendaciones con score sobre el promedio"
        />
        <TarjetaMetrica
          icono={TrendingUp}
          titulo="Relevancia"
          valor={metricas.relevancia}
          color="border-blue-600"
          descripcion="Similitud con tus preferencias recientes"
        />
        <TarjetaMetrica
          icono={Award}
          titulo="Accuracy del Modelo"
          valor={metricas.accuracy}
          color="border-indigo-600"
          descripcion="Precisión general del modelo de IA"
        />
        <TarjetaMetrica
          icono={Zap}
          titulo="Diversidad"
          valor={metricas.diversidad}
          color="border-orange-600"
          descripcion="Variedad de categorías recomendadas"
        />
        <TarjetaMetrica
          icono={Activity}
          titulo="Novedad"
          valor={metricas.novedad}
          color="border-pink-600"
          descripcion="Productos fuera de tu categoría favorita"
        />
      </div>

      {/* Gráficas de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart de Métricas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2 text-purple-600" size={24} />
            Análisis Multidimensional del Modelo
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={datosRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metrica" style={{ fontSize: "12px" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Rendimiento"
                dataKey="valor"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Interpretación:</strong> Valores más cercanos al borde
              exterior indican mejor rendimiento. Un modelo equilibrado debe
              tener valores altos en todas las dimensiones.
            </p>
          </div>
        </div>

        {/* Evolución del Loss */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={24} />
            Evolución del Loss (Error del Modelo)
          </h3>
          {metricas.evolucionLoss.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas.evolucionLoss}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="generacion" style={{ fontSize: "12px" }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Loss (%)"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Tendencia:</strong> Un loss descendente indica que el
                  modelo está aprendiendo correctamente.
                  {parseFloat(metricas.evolucionLoss[0]?.loss || 0) >
                  parseFloat(metricas.evolucionLoss.slice(-1)[0]?.loss || 0)
                    ? " ✅ El modelo está mejorando con cada entrenamiento."
                    : " ⚠️ El modelo puede necesitar más datos para mejorar."}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No hay suficientes generaciones para mostrar la evolución
            </div>
          )}
        </div>

        {/* Comparación de Métricas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Award className="mr-2 text-green-600" size={24} />
            Comparación de Métricas Clave
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  nombre: "Precisión",
                  valor: parseFloat(metricas.precisionAtK),
                },
                {
                  nombre: "Relevancia",
                  valor: parseFloat(metricas.relevancia),
                },
                { nombre: "Accuracy", valor: parseFloat(metricas.accuracy) },
                { nombre: "Hit Rate", valor: parseFloat(metricas.hitRate) },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" style={{ fontSize: "12px" }} />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
              <Bar dataKey="valor" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recomendaciones de Mejora */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Brain className="mr-2 text-indigo-600" size={24} />
            Recomendaciones de Mejora
          </h3>
          <div className="space-y-3">
            {parseFloat(metricas.accuracy) < 70 && (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Accuracy Bajo:</strong> El modelo necesita más
                  datos de entrenamiento. Realiza más compras para mejorar la
                  precisión.
                </p>
              </div>
            )}
            {parseFloat(metricas.diversidad) < 50 && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700">
                  <strong>💡 Poca Diversidad:</strong> Las recomendaciones se
                  concentran en pocas categorías. Explora más categorías para
                  balancear el modelo.
                </p>
              </div>
            )}
            {parseFloat(metricas.precisionAtK) < 40 && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-gray-700">
                  <strong>🎯 Precisión Baja:</strong> Las recomendaciones no se
                  alinean bien con tus compras. El modelo seguirá mejorando con
                  más interacciones.
                </p>
              </div>
            )}
            {parseFloat(metricas.accuracy) >= 70 &&
              parseFloat(metricas.diversidad) >= 50 &&
              parseFloat(metricas.precisionAtK) >= 40 && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>✅ Excelente Rendimiento:</strong> El modelo está
                    funcionando muy bien. Las recomendaciones son precisas y
                    diversificadas.
                  </p>
                </div>
              )}
            <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
              <p className="text-sm text-gray-700">
                <strong>🧠 Info:</strong> La red neuronal usa{" "}
                {estadisticasIA?.parametros || "múltiples"} parámetros y ha
                completado {estadisticasIA?.generacion || 0} generaciones de
                entrenamiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metricas;
