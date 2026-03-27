import { useRef, useEffect, useState } from "react";
import { useData } from "./hooks/useData";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import Charts from "./components/Charts";
import Comparar from "./components/Comparar";
import Prediccion from "./components/Prediccion";
import Insights from "./components/Insights";
import Climatico from "./components/Climatico";
import FloatingMenu from './components/FloatingMenu'
import DashboardPowerBI from "./components/DashboardPowerBI";

// ── Secciones para el scroll spy ─────────────────────────────────────────────
const SECCIONES = [
  { id: "hero", label: "Inicio" },
  { id: "stats", label: "Estadísticas" },
  { id: "charts", label: "Gráficas" },
  { id: "climatico", label: "Clima" }, // ← nueva
  { id: "comparar", label: "Comparar" },
  { id: "prediccion", label: "Predicción" },
  { id: "insights", label: "Insights" },
];
// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ seccionActiva }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">⚡ Energía Renovable — Región 6</span>

      {/* Dots con tooltip al hover */}
      <div className="navbar-dots">
        {SECCIONES.map(({ id, label }) => (
          <div key={id} style={{ position: "relative" }}>
            <button
              className={`nav-dot ${seccionActiva === id ? "active" : ""}`}
              onClick={() => scrollTo(id)}
              title={label}
            />
            {/* Tooltip */}
            <span
              style={{
                position: "absolute",
                bottom: "140%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1a2540",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "var(--text-secondary)",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.2s",
                zIndex: 10,
              }}
              className="nav-tooltip"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Estado de carga global ────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-900)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        zIndex: 999,
      }}
    >
      {/* Logo animado */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          animation: "pulse 1.5s ease infinite",
        }}
      >
        ⚡
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "var(--purple-light)",
            fontWeight: 700,
            fontSize: "1rem",
            marginBottom: 6,
          }}
        >
          Cargando datos energéticos
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          Conectando con la API...
        </p>
      </div>

      {/* Barra de progreso animada */}
      <div
        style={{
          width: 200,
          height: 3,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--purple), var(--green))",
            borderRadius: 2,
            animation: "loadBar 1.4s ease infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Pantalla de error ─────────────────────────────────────────────────────────
function ErrorScreen({ mensaje }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-900)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        zIndex: 999,
        padding: 24,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
        }}
      >
        ⚠
      </div>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p
          style={{
            color: "#f87171",
            fontWeight: 700,
            fontSize: "1rem",
            marginBottom: 8,
          }}
        >
          Error al conectar con el backend
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
        >
          {mensaje ||
            "Verifica que el contenedor Docker esté corriendo en el puerto 8000."}
        </p>
      </div>
      <button
        className="btn btn-outline"
        onClick={() => window.location.reload()}
        style={{ marginTop: 8 }}
      >
        Reintentar
      </button>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const { data, loading, error } = useData();
  const [seccionActiva, setSeccionActiva] = useState("hero");
  const prediccionRef = useRef(null);

  // ── Scroll spy: detecta qué sección está en pantalla ─────────────────────
  useEffect(() => {
    const observers = SECCIONES.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setSeccionActiva(id);
        },
        { threshold: 0.35 },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, [data]); // re-registra cuando los datos cargan y los componentes se montan

  // ── Tooltip en navbar dots ────────────────────────────────────────────────
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .nav-dot:hover + .nav-tooltip { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Animación barra de carga ──────────────────────────────────────────────
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes loadBar {
        0%   { width: 0%;    margin-left: 0; }
        50%  { width: 60%;   margin-left: 20%; }
        100% { width: 0%;    margin-left: 100%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Función que abre el takeover desde el Hero ────────────────────────────
  const abrirPrediccion = () => {
    document
      .getElementById("prediccion")
      ?.scrollIntoView({ behavior: "smooth" });
    // Pequeño delay para que el scroll termine antes de abrir el panel
    setTimeout(() => {
      prediccionRef.current?.();
    }, 600);
  };

  // ── Renders condicionales ─────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen mensaje={error} />;

  const { stats, mensual, porDepto, insights } = data;

  return (
    <>
      <Navbar seccionActiva={seccionActiva} />

      <main>
        <Hero onScrollToPrediccion={abrirPrediccion} />

        <StatsBar stats={stats} />

        <Charts mensual={mensual} porDepto={porDepto} />
        <Climatico />

        <Comparar mensual={mensual} porDepto={porDepto} />

        <Prediccion refProp={prediccionRef} />

        <Insights insights={insights} porDepto={porDepto} />
        <DashboardPowerBI></DashboardPowerBI>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            lineHeight: 1.8,
          }}
        >
          Hackathon Talento Tech 2026 — Región 6 · Reto 1 + Reto 6
          <br />
          Datos: SIEL / MinEnergía · Modelo: Prophet (Meta) · Stack: FastAPI +
          React
        </p>

      </footer>
      <FloatingMenu />

    </>

  );
}
