// src/App.jsx

import React, { useState, useEffect, useCallback } from "react";

// Importar componentes
import Header from "./components/Header";
import Navigation from "./components/Navigation";

// Importar vistas
import Login from "./views/Login";
import Catalogo from "./views/Catalogo";
import Recomendaciones from "./views/Recomendaciones";
import Historial from "./views/Historial";
import Carrito from "./views/Carrito";
import Graficas from "./views/Graficas";

// Importar utilidades
import RedNeuronalRecomendacion from "./utils/RedNeuronal";

// 🆕 FUNCIÓN PARA CALCULAR NÚMERO DINÁMICO DE RECOMENDACIONES
const calcularNumeroRecomendaciones = (historialCompras) => {
  const numCompras = historialCompras.length;

  // Lógica progresiva:
  // 1-2 compras: 4 recomendaciones
  // 3-4 compras: 5 recomendaciones
  // 5-7 compras: 6 recomendaciones
  // 8-9 compras: 8 recomendaciones
  // 10+ compras: 10 recomendaciones

  if (numCompras === 0) return 0;
  if (numCompras <= 2) return 4;
  if (numCompras <= 4) return 5;
  if (numCompras <= 7) return 6;
  if (numCompras <= 9) return 8;
  return 10;
};

export default function App() {
  // Estados principales
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [historialCompras, setHistorialCompras] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [redNeuronal] = useState(new RedNeuronalRecomendacion());
  const [mostrarLogin, setMostrarLogin] = useState(true);
  const [formLogin, setFormLogin] = useState({ username: "", password: "" });
  const [modoRegistro, setModoRegistro] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [vistaActual, setVistaActual] = useState("catalogo");
  const [estadisticasIA, setEstadisticasIA] = useState(null);

  // Función para actualizar recomendaciones
  const actualizarRecomendaciones = useCallback(async () => {
    if (historialCompras.length > 0) {
      // Entrenar la red neuronal con el historial actual
      await redNeuronal.entrenar(historialCompras);

      // 🆕 CALCULAR NÚMERO DINÁMICO DE RECOMENDACIONES
      const numRecomendaciones =
        calcularNumeroRecomendaciones(historialCompras);

      // Generar nuevas recomendaciones con el número dinámico
      const nuevasRecomendaciones = await redNeuronal.recomendar(
        historialCompras,
        numRecomendaciones
      );
      setRecomendaciones(nuevasRecomendaciones);

      // Obtener estadísticas del modelo
      const stats = redNeuronal.obtenerEstadisticas();
      setEstadisticasIA(stats);

      console.log("🧠 Recomendaciones actualizadas:", {
        generacion: stats.generacion,
        numCompras: historialCompras.length,
        numRecomendaciones: nuevasRecomendaciones.length,
        comprasAnalizadas: historialCompras.length,
      });
    } else {
      setRecomendaciones([]);
      setEstadisticasIA(null);
    }
  }, [historialCompras, redNeuronal]);

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    if (usuarioActual) {
      const historial = JSON.parse(
        localStorage.getItem(`historial_${usuarioActual}`) || "[]"
      );
      setHistorialCompras(historial);
    }
  }, [usuarioActual]);

  // Actualizar recomendaciones cuando cambia el historial
  useEffect(() => {
    if (usuarioActual) {
      actualizarRecomendaciones();

      // Guardar historial en localStorage
      if (historialCompras.length > 0) {
        localStorage.setItem(
          `historial_${usuarioActual}`,
          JSON.stringify(historialCompras)
        );
      }
    }
  }, [historialCompras, usuarioActual, actualizarRecomendaciones]);

  // Manejo de login y registro
  const handleLogin = () => {
    if (!formLogin.username || !formLogin.password) {
      alert("Por favor completa todos los campos");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (modoRegistro) {
      if (usuarios[formLogin.username]) {
        alert("El usuario ya existe");
        return;
      }
      usuarios[formLogin.username] = formLogin.password;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      alert("✅ Usuario registrado exitosamente");
      setModoRegistro(false);
    } else {
      if (
        !usuarios[formLogin.username] ||
        usuarios[formLogin.username] !== formLogin.password
      ) {
        alert("❌ Usuario o contraseña incorrectos");
        return;
      }
      setUsuarioActual(formLogin.username);
      setMostrarLogin(false);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    setUsuarioActual(null);
    setHistorialCompras([]);
    setRecomendaciones([]);
    setCarrito([]);
    setEstadisticasIA(null);
    setMostrarLogin(true);
    setFormLogin({ username: "", password: "" });
    setVistaActual("catalogo");
  };

  // Comprar producto directamente
  const comprarProducto = (producto) => {
    const nuevoHistorial = [
      ...historialCompras,
      {
        ...producto,
        fechaCompra: new Date().toISOString(),
      },
    ];

    setHistorialCompras(nuevoHistorial);
    setCarrito([]);

    // 🆕 Mensaje mejorado con número dinámico
    const numRecsNuevas = calcularNumeroRecomendaciones(nuevoHistorial);
    alert(
      `✅ ¡${producto.nombre} comprado exitosamente!\n\n🤖 La IA está actualizando ${numRecsNuevas} recomendaciones personalizadas...`
    );

    // Cambiar automáticamente a la vista de recomendaciones para ver el cambio
    setTimeout(() => {
      setVistaActual("recomendaciones");
    }, 100);
  };

  // Agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);

    // Feedback visual mejorado
    const Toast = document.createElement("div");
    Toast.className =
      "fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce";
    Toast.innerHTML = `✅ ${producto.nombre} agregado al carrito`;
    document.body.appendChild(Toast);

    setTimeout(() => {
      Toast.remove();
    }, 2000);
  };

  // Remover del carrito
  const removerDelCarrito = (index) => {
    const productoRemovido = carrito[index];
    setCarrito(carrito.filter((_, i) => i !== index));

    // Feedback visual
    const Toast = document.createElement("div");
    Toast.className =
      "fixed top-20 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    Toast.innerHTML = `🗑️ ${productoRemovido.nombre} eliminado del carrito`;
    document.body.appendChild(Toast);

    setTimeout(() => {
      Toast.remove();
    }, 2000);
  };

  // Finalizar compra del carrito
  const finalizarCompra = () => {
    if (carrito.length === 0) return;

    const productosConFecha = carrito.map((p) => ({
      ...p,
      fechaCompra: new Date().toISOString(),
    }));

    const nuevoHistorial = [...historialCompras, ...productosConFecha];
    setHistorialCompras(nuevoHistorial);

    const numProductos = carrito.length;
    setCarrito([]);

    // 🆕 Mensaje mejorado con número dinámico
    const numRecsNuevas = calcularNumeroRecomendaciones(nuevoHistorial);
    alert(
      `✅ ¡Compra de ${numProductos} producto${
        numProductos > 1 ? "s" : ""
      } realizada exitosamente!\n\n🤖 La Red Neuronal está aprendiendo de tu nueva compra y generando ${numRecsNuevas} recomendaciones actualizadas...`
    );

    // Ir a la vista de recomendaciones para ver los cambios
    setTimeout(() => {
      setVistaActual("recomendaciones");
    }, 100);
  };

  // Mostrar vista de login si no hay usuario
  if (mostrarLogin) {
    return (
      <Login
        formLogin={formLogin}
        setFormLogin={setFormLogin}
        modoRegistro={modoRegistro}
        setModoRegistro={setModoRegistro}
        onLogin={handleLogin}
      />
    );
  }

  // Vista principal de la aplicación
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        usuarioActual={usuarioActual}
        carritoCount={carrito.length}
        onVerCarrito={() => setVistaActual("carrito")}
        onLogout={handleLogout}
      />

      <Navigation vistaActual={vistaActual} onCambiarVista={setVistaActual} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {vistaActual === "catalogo" && (
          <Catalogo onAddToCart={agregarAlCarrito} onBuyNow={comprarProducto} />
        )}

        {vistaActual === "recomendaciones" && (
          <Recomendaciones
            recomendaciones={recomendaciones}
            historialCompras={historialCompras}
            estadisticasIA={estadisticasIA}
            onAddToCart={agregarAlCarrito}
            onBuyNow={comprarProducto}
          />
        )}

        {vistaActual === "historial" && (
          <Historial historialCompras={historialCompras} />
        )}

        {vistaActual === "graficas" && (
          <Graficas historialCompras={historialCompras} />
        )}

        {vistaActual === "carrito" && (
          <Carrito
            carrito={carrito}
            onRemoverDelCarrito={removerDelCarrito}
            onFinalizarCompra={finalizarCompra}
          />
        )}
      </div>

      {/* Indicador de estado de IA (opcional) */}
      {historialCompras.length > 0 && vistaActual !== "recomendaciones" && (
        <div
          className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer hover:bg-purple-700 transition"
          onClick={() => setVistaActual("recomendaciones")}
        >
          <span className="animate-pulse">🧠</span>
          <span className="text-sm font-semibold">
            {recomendaciones.length} recomendaciones actualizadas
          </span>
        </div>
      )}
    </div>
  );
}
