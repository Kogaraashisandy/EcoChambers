import { useState, useEffect, useRef } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { usePrediccion } from "../hooks/useData";

const DEPARTAMENTOS = ["Atlántico", "Cesar", "La Guajira", "Magdalena"];
const TECNOLOGIAS = ["Solar", "Eólica"];

// ── Animación sol ─────────────────────────────────────────────────────────────
function SunLoader({ texto }) {
  return (
    <div className="loader-container">
      <svg
        className="sun-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" fill="rgba(245,158,11,0.15)" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <p className="loader-text">{texto}</p>
    </div>
  );
}

// ── Animación ventilador ──────────────────────────────────────────────────────
function FanLoader({ texto }) {
  return (
    <div className="loader-container">
      <svg
        className="fan-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="2" fill="rgba(59,130,246,0.2)" />
        {/* Aspa 1 */}
        <path
          d="M12 10C12 10 10 6 12 3C14 6 12 10 12 10Z"
          fill="rgba(59,130,246,0.3)"
          stroke="currentColor"
        />
        {/* Aspa 2 */}
        <path
          d="M14 12C14 12 18 14 21 12C18 10 14 12 14 12Z"
          fill="rgba(59,130,246,0.3)"
          stroke="currentColor"
        />
        {/* Aspa 3 */}
        <path
          d="M12 14C12 14 14 18 12 21C10 18 12 14 12 14Z"
          fill="rgba(59,130,246,0.3)"
          stroke="currentColor"
        />
        {/* Aspa 4 */}
        <path
          d="M10 12C10 12 6 10 3 12C6 14 10 12 10 12Z"
          fill="rgba(59,130,246,0.3)"
          stroke="currentColor"
        />
      </svg>
      <p className="loader-text">{texto}</p>
    </div>
  );
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const esPrediccion = label > "2024-12";
  const esVerificable = label > "2024-12" && label <= "2026-03";
  const esFuturo = label > "2026-03";

  return (
    <div
      style={{
        background: "#111827",
        border: `1px solid ${esPrediccion ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: "0.85rem",
        minWidth: 210,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          {label}
        </span>
        {esVerificable && (
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              background: "rgba(245,158,11,0.2)",
              color: "#fbbf24",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            VERIFICABLE
          </span>
        )}
        {esFuturo && (
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              background: "rgba(139,92,246,0.2)",
              color: "#a78bfa",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            PROYECCIÓN
          </span>
        )}
      </div>
      {payload.map(
        (p) =>
          p.value != null && (
            <div
              key={p.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                color: p.color ?? "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              <span>{p.name}</span>
              <span style={{ fontWeight: 700 }}>
                {Number(p.value).toLocaleString()} MWh
              </span>
            </div>
          ),
      )}
    </div>
  );
}
// ── Gráfica de resultado ──────────────────────────────────────────────────────
function GraficaPrediccion({ resultado, tecnologia }) {
  const color = tecnologia === "Solar" ? "#f59e0b" : "#3b82f6";

  // Combinar histórico + predicción en un solo array
  const histSet = new Set(resultado.historico.map((h) => h.fecha));
  const datos = [
    ...resultado.historico.map((h) => ({
      fecha: h.fecha,
      real: h.real,
      prediccion: null,
      min: null,
      max: null,
    })),
    ...resultado.prediccion
      .filter((p) => !histSet.has(p.fecha))
      .map((p) => ({
        fecha: p.fecha,
        real: null,
        prediccion: Math.max(0, Math.round(p.prediccion)),
        min: Math.max(0, Math.round(p.min)),
        max: Math.max(0, Math.round(p.max)),
      })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Último mes histórico para la línea de referencia
  const ultimoHistorico = resultado.historico.at(-1)?.fecha;

  return (
    <div style={{ animation: "fadeInUp 0.7s ease forwards" }}>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={datos}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />

          <XAxis
            dataKey="fecha"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickFormatter={(v) => v.slice(2)} // "2024-01" → "24-01"
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: "0.78rem", paddingTop: 16 }}
            formatter={(v) => (
              <span style={{ color: "var(--text-secondary)" }}>{v}</span>
            )}
          />

          {/* Línea divisoria histórico → predicción */}
          {ultimoHistorico && (
            <ReferenceLine
              x={ultimoHistorico}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
              label={{
                value: "Hoy",
                position: "top",
                fill: "var(--text-muted)",
                fontSize: 10,
              }}
            />
          )}

          {/* Banda de incertidumbre */}
          <Area
            dataKey="max"
            fill={`${color}18`}
            stroke="none"
            name="Máx. esperado"
            legendType="none"
          />
          <Area
            dataKey="min"
            fill="var(--bg-900)"
            stroke="none"
            name="Mín. esperado"
            legendType="none"
          />

          {/* Línea histórica */}
          <Line
            type="monotone"
            dataKey="real"
            stroke={color}
            strokeWidth={2.5}
            name="Histórico real"
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />

          {/* Línea de predicción */}
          <Line
            type="monotone"
            dataKey="prediccion"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 4"
            name="Predicción Prophet"
            dot={{ r: 3, fill: color, strokeWidth: 0, fillOpacity: 0.5 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Nota de interpretación */}
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.78rem",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        La banda sombreada representa el intervalo de confianza del 80%. La
        línea discontinua es la proyección del modelo Prophet.
      </p>
    </div>
  );
}

// ── Panel takeover ────────────────────────────────────────────────────────────
function TakeoverPanel({ onCerrar }) {
  const [depto, setDepto] = useState("Atlántico");
  const [tecnologia, setTecnologia] = useState("Solar");
  const [meses, setMeses] = useState(12);
  const { predecir, resultado, loading, limpiar } = usePrediccion();

  const handleCerrar = () => {
    limpiar();
    onCerrar();
  };

  const textoLoader =
    tecnologia === "Solar"
      ? "Calculando radiación solar..."
      : "Analizando velocidad del viento...";

  return (
    <div
      className="takeover-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCerrar();
      }}
    >
      <div className="takeover-panel" style={{ maxWidth: 820 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: 4 }}>
              Modelo Prophet
            </p>
            <h2
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                fontWeight: 700,
                background: "linear-gradient(135deg, #e2d9ff, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Generador de predicciones
            </h2>
          </div>
          <button
            onClick={handleCerrar}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "var(--text-muted)",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Si no hay resultado aún — mostrar controles */}
        {!resultado && !loading && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 20,
                marginBottom: 28,
              }}
            >
              {/* Departamento */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--purple-light)",
                    marginBottom: 8,
                  }}
                >
                  Departamento
                </label>
                <select
                  value={depto}
                  onChange={(e) => setDepto(e.target.value)}
                >
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tecnología */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--purple-light)",
                    marginBottom: 8,
                  }}
                >
                  Tecnología
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {TECNOLOGIAS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTecnologia(t)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        border: "1px solid",
                        transition: "all 0.2s",
                        background:
                          tecnologia === t
                            ? t === "Solar"
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(59,130,246,0.15)"
                            : "var(--bg-700)",
                        borderColor:
                          tecnologia === t
                            ? t === "Solar"
                              ? "#f59e0b"
                              : "#3b82f6"
                            : "var(--border)",
                        color:
                          tecnologia === t
                            ? t === "Solar"
                              ? "#fbbf24"
                              : "#60a5fa"
                            : "var(--text-muted)",
                      }}
                    >
                      {t === "Solar" ? "☀ Solar" : "💨 Eólica"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de meses */}
              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--purple-light)",
                    marginBottom: 8,
                  }}
                >
                  <span>Meses a predecir</span>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      background: "rgba(139,92,246,0.15)",
                      borderRadius: 6,
                      padding: "1px 8px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {meses} meses
                  </span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={24}
                  step={1}
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                  style={{ width: "100%", marginTop: 8 }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  <span>3 meses</span>
                  <span>24 meses</span>
                </div>
              </div>
            </div>

            {/* Botón generar */}
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px",
              }}
              onClick={() =>
                predecir({ departamento: depto, tecnologia, meses })
              }
            >
              Generar predicción para {depto} — {tecnologia}
            </button>
          </>
        )}

        {/* Loader animado */}
        {loading &&
          (tecnologia === "Solar" ? (
            <SunLoader texto={textoLoader} />
          ) : (
            <FanLoader texto={textoLoader} />
          ))}

        {/* Resultado */}
        {resultado && !loading && (
          <div>
            {/* Header del resultado */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span
                  className={`badge ${
                    resultado.tecnologia === "Solar"
                      ? "badge-amber"
                      : "badge-purple"
                  }`}
                >
                  {resultado.tecnologia === "Solar" ? "☀" : "💨"}{" "}
                  {resultado.tecnologia}
                </span>
                <span className="badge badge-green">
                  {resultado.departamento}
                </span>
                <span className="badge badge-purple">+{meses} meses</span>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: "8px 18px", fontSize: "0.8rem" }}
                onClick={limpiar}
              >
                Nueva predicción
              </button>
            </div>

            <GraficaPrediccion
              resultado={resultado}
              tecnologia={resultado.tecnologia}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal exportado ────────────────────────────────────────────
export default function Prediccion({ refProp }) {
  const [abierto, setAbierto] = useState(false);

  // Permite que App.jsx abra el takeover desde el botón del Hero
  useEffect(() => {
    if (refProp) refProp.current = () => setAbierto(true);
  }, [refProp]);

  return (
    <>
      <section id="prediccion" ref={refProp}>
        <div className="section">
          <p className="section-label">Inteligencia artificial</p>
          <h2 className="section-title">Predicciones con Prophet</h2>
          <p className="section-subtitle">
            Modelo entrenado con producción real 2024. Las proyecciones cubren
            2025–2026 —{" "}
            <span style={{ color: "var(--purple-light)", fontWeight: 600 }}>
              ahora verificables con el tiempo transcurrido.
            </span>
          </p>
          {/* Card de llamada a la acción */}
          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "60px 40px",
              gap: 24,
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(16,185,129,0.05))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            {/* Íconos decorativos */}
            <div style={{ display: "flex", gap: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                }}
              >
                ☀
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                }}
              >
                💨
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 10,
                }}
              >
                ¿Cuánta energía generará tu departamento?
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  maxWidth: 420,
                  lineHeight: 1.6,
                }}
              >
                Modelo entrenado con producción 2024. Predicciones hasta 2027
                con intervalos de confianza del 80%.
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: "14px 40px", fontSize: "1rem" }}
              onClick={() => setAbierto(true)}
            >
              Abrir generador de predicciones
            </button>
          </div>
        </div>
      </section>

      {/* Portal del takeover */}
      {abierto && <TakeoverPanel onCerrar={() => setAbierto(false)} />}
    </>
  );
}
