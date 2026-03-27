import { useState, useEffect, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ── Hook para datos climáticos ────────────────────────────────────────────────
function useClimatico() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/climatico/resumen").then((r) => r.json()),
      fetch("/api/climatico/series").then((r) => r.json()),
      fetch("/api/climatico/zonas-optimas").then((r) => r.json()),
    ])
      .then(([resumen, series, zonas]) => setData({ resumen, series, zonas }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ── Paleta por departamento ───────────────────────────────────────────────────
const COLORES = {
  "La Guajira": "#8b5cf6",
  Atlántico: "#10b981",
  Cesar: "#f59e0b",
  Magdalena: "#3b82f6",
};

const APTITUD_CONFIG = {
  óptima: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    text: "#34d399",
  },
  alta: {
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.3)",
    text: "#a78bfa",
  },
  media: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    text: "#fbbf24",
  },
  baja: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    text: "#f87171",
  },
};

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid rgba(139,92,246,0.4)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: "0.85rem",
        minWidth: 190,
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            color: p.color,
            marginBottom: 4,
          }}
        >
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tabla resumen por departamento ────────────────────────────────────────────
function TablaResumen({ resumen }) {
  const COLS = [
    {
      key: "radiacion_promedio",
      label: "Radiación",
      unidad: "kWh/m²",
      icono: "☀",
    },
    { key: "viento_promedio", label: "Viento", unidad: "m/s", icono: "💨" },
    {
      key: "temperatura_promedio",
      label: "Temperatura",
      unidad: "°C",
      icono: "🌡",
    },
  ];

  return (
    <div className="card" style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
      <p className="section-label" style={{ marginBottom: 6 }}>
        Variables climáticas
      </p>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Condiciones promedio por departamento — 2024
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Fuente: Atlas de Radiación Solar y Viento — IDEAM / UPME
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <th
              style={{
                textAlign: "left",
                padding: "10px 16px",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Departamento
            </th>
            {COLS.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "center",
                  padding: "10px 16px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {c.icono} {c.label} ({c.unidad})
              </th>
            ))}
            <th
              style={{
                textAlign: "center",
                padding: "10px 16px",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Aptitud Solar
            </th>
            <th
              style={{
                textAlign: "center",
                padding: "10px 16px",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Aptitud Eólica
            </th>
          </tr>
        </thead>
        <tbody>
          {resumen
            .sort((a, b) => b.radiacion_promedio - a.radiacion_promedio)
            .map((d, i) => {
              const color = COLORES[d.departamento] || "#94a3b8";
              const cSolar =
                APTITUD_CONFIG[d.aptitud_solar] || APTITUD_CONFIG.baja;
              const cEolica =
                APTITUD_CONFIG[d.aptitud_eolica] || APTITUD_CONFIG.baja;
              return (
                <tr
                  key={d.departamento}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(139,92,246,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")
                  }
                >
                  {/* Departamento */}
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {d.departamento}
                      </span>
                    </div>
                  </td>
                  {/* Valores numéricos */}
                  {COLS.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        color: color,
                        fontWeight: 700,
                      }}
                    >
                      {Number(d[c.key]).toFixed(2)}
                    </td>
                  ))}
                  {/* Aptitud solar */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: cSolar.bg,
                        border: `1px solid ${cSolar.border}`,
                        color: cSolar.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {d.aptitud_solar}
                    </span>
                  </td>
                  {/* Aptitud eólica */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: cEolica.bg,
                        border: `1px solid ${cEolica.border}`,
                        color: cEolica.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {d.aptitud_eolica}
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

// ── Gráfica radar multivariada ────────────────────────────────────────────────
function GraficaRadar({ resumen }) {
  // Normalizar 0-100 para que las 3 variables sean comparables en el radar
  const maxRad = Math.max(...resumen.map((d) => d.radiacion_promedio));
  const maxViento = Math.max(...resumen.map((d) => d.viento_promedio));
  const maxTemp = Math.max(...resumen.map((d) => d.temperatura_promedio));

  const datos = [
    {
      variable: "Radiación solar",
      ...Object.fromEntries(
        resumen.map((d) => [
          d.departamento,
          +((d.radiacion_promedio / maxRad) * 100).toFixed(1),
        ]),
      ),
    },
    {
      variable: "Velocidad viento",
      ...Object.fromEntries(
        resumen.map((d) => [
          d.departamento,
          +((d.viento_promedio / maxViento) * 100).toFixed(1),
        ]),
      ),
    },
    {
      variable: "Temperatura",
      ...Object.fromEntries(
        resumen.map((d) => [
          d.departamento,
          +((d.temperatura_promedio / maxTemp) * 100).toFixed(1),
        ]),
      ),
    },
  ];

  return (
    <div className="card">
      <p className="section-label" style={{ marginBottom: 6 }}>
        Comparativa multivariada
      </p>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Perfil climático por departamento
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Valores normalizados 0–100 para comparación entre variables
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={datos}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="variable"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          {resumen.map((d) => (
            <Radar
              key={d.departamento}
              name={d.departamento}
              dataKey={d.departamento}
              stroke={COLORES[d.departamento]}
              fill={COLORES[d.departamento]}
              fillOpacity={0.08}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "0.78rem", paddingTop: 12 }}
            formatter={(v) => (
              <span style={{ color: "var(--text-secondary)" }}>{v}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Series temporales por variable ────────────────────────────────────────────
function GraficaSeries({ series, variable, label, unidad, color }) {
  const pivotado = useMemo(() => {
    const mapa = {};
    series.forEach(({ mes, departamento, ...vals }) => {
      if (!mapa[mes]) mapa[mes] = { mes };
      mapa[mes][departamento] = vals[variable];
    });
    return Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [series, variable]);

  const deptos = ["La Guajira", "Atlántico", "Cesar", "Magdalena"];

  return (
    <div className="card">
      <p className="section-label" style={{ marginBottom: 6 }}>
        Serie temporal
      </p>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 20,
        }}
      >
        {label} mensual por departamento ({unidad})
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={pivotado}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="mes"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            tickFormatter={(v) => v.slice(5)}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }}
            formatter={(v) => (
              <span style={{ color: "var(--text-secondary)" }}>{v}</span>
            )}
          />
          {deptos.map((d) => (
            <Line
              key={d}
              type="monotone"
              dataKey={d}
              stroke={COLORES[d]}
              strokeWidth={2}
              dot={{ r: 2, fill: COLORES[d], strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Tarjetas de zonas óptimas ─────────────────────────────────────────────────
function ZonasOptimas({ zonas }) {
  const cards = [
    {
      icono: "☀",
      label: "Zona óptima solar",
      depto: zonas.zona_optima_solar,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.25)",
      texto:
        "Mayor radiación solar promedio anual. Ideal para parques fotovoltaicos.",
    },
    {
      icono: "💨",
      label: "Zona óptima eólica",
      depto: zonas.zona_optima_eolica,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.25)",
      texto:
        "Mayor velocidad de viento consistente. Ideal para aerogeneradores.",
    },
    {
      icono: "⚡",
      label: "Mejor zona integral",
      depto: zonas.zona_optima_general,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
      texto:
        "Mayor score compuesto (45% solar + 40% viento + 15% temperatura).",
    },
  ];

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.4rem" }}>{c.icono}</span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: c.color,
                }}
              >
                {c.label}
              </span>
            </div>
            <div
              style={{
                fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
                fontWeight: 800,
                color: c.color,
                lineHeight: 1.1,
              }}
            >
              {c.depto}
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                lineHeight: 1.5,
              }}
            >
              {c.texto}
            </p>
          </div>
        ))}
      </div>

      {/* Ranking score compuesto */}
      <div className="card">
        <p className="section-label" style={{ marginBottom: 6 }}>
          Score integral de aptitud renovable
        </p>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Ranking de zonas para nuevas instalaciones
        </h3>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            marginBottom: 20,
            lineHeight: 1.5,
            maxWidth: 560,
            fontStyle: "italic",
          }}
        >
          {zonas.metodologia}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {zonas.ranking.map(
            (
              { departamento, radiacion, viento, temperatura, score_renovable },
              i,
            ) => {
              const color = COLORES[departamento] || "#94a3b8";
              const pct = score_renovable * 100;
              return (
                <div key={departamento}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          background: `${color}20`,
                          border: `1px solid ${color}50`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {departamento}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.78rem",
                        }}
                      >
                        ☀ {radiacion} · 💨 {viento} m/s · 🌡 {temperatura}°C
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        color,
                        fontSize: "1rem",
                      }}
                    >
                      {(score_renovable * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.05)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        borderRadius: 4,
                        transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
function ConexionRetos({ resumen }) {
  if (!resumen?.length) return null;

  // Calcular automáticamente los líderes para hacer el texto dinámico
  const liderSolar = [...resumen].sort(
    (a, b) => b.radiacion_promedio - a.radiacion_promedio,
  )[0];
  const liderEolico = [...resumen].sort(
    (a, b) => b.viento_promedio - a.viento_promedio,
  )[0];

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(16,185,129,0.06))",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 20,
        padding: "32px 36px",
        marginTop: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          🔗
        </div>
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a78bfa",
              marginBottom: 2,
            }}
          >
            Conexión Reto 1 + Reto 6
          </p>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            ¿Por qué produce cada departamento lo que produce?
          </h3>
        </div>
      </div>

      {/* Dos columnas de conexión */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Solar */}
        <div
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>☀</span>
            <span
              style={{
                fontWeight: 700,
                color: "#fbbf24",
                fontSize: "0.85rem",
              }}
            >
              Energía Solar
            </span>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>
              {liderSolar.departamento}
            </span>{" "}
            registra la mayor radiación solar con{" "}
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>
              {liderSolar.radiacion_promedio} kWh/m²
            </span>{" "}
            promedio diario según el Atlas IDEAM. Esto explica directamente su
            posición de liderazgo en producción solar en los datos reales del
            Reto 1, donde acumula la mayor generación fotovoltaica de la región.
          </p>
        </div>

        {/* Eólica */}
        <div
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 14,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>💨</span>
            <span
              style={{
                fontWeight: 700,
                color: "#60a5fa",
                fontSize: "0.85rem",
              }}
            >
              Energía Eólica
            </span>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>
              {liderEolico.departamento}
            </span>{" "}
            presenta vientos superiores a{" "}
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>
              {liderEolico.viento_promedio} m/s
            </span>{" "}
            de manera constante durante todo el año, alcanzando picos de hasta
            11 m/s en temporada seca. El Atlas IDEAM confirma esta zona como la
            de mayor potencial eólico del país, lo que respalda su capacidad
            instalada actual.
          </p>
        </div>
      </div>

      {/* Conclusión central */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "1.1rem",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          💡
        </span>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            Conclusión:{" "}
          </span>
          Los datos climáticos del Reto 6 y los datos de producción del Reto 1
          cuentan la misma historia desde ángulos distintos. Las condiciones
          naturales identificadas por el IDEAM explican los patrones de
          generación actuales y, más importante, señalan{" "}
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>
            dónde conviene instalar nueva infraestructura renovable
          </span>{" "}
          para maximizar el retorno energético de la región.
        </p>
      </div>
    </div>
  );
}
// ── Componente principal ──────────────────────────────────────────────────────
export default function Climatico() {
  const { data, loading, error } = useClimatico();
  const [tabActiva, setTabActiva] = useState("resumen");

  if (loading)
    return (
      <section id="climatico">
        <div className="section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 0",
              color: "var(--text-muted)",
            }}
          >
            Cargando datos climáticos...
          </div>
        </div>
      </section>
    );

  if (error) return null;

  const TABS = [
    { id: "resumen", label: "Tabla resumen" },
    { id: "series", label: "Series temporales" },
    { id: "zonas", label: "Zonas óptimas" },
  ];

  return (
    <section id="climatico">
      <div className="section">
        <p className="section-label">Reto 6 — Variables climáticas</p>
        <h2 className="section-title">Condiciones para energías renovables</h2>
        <p className="section-subtitle">
          Análisis de radiación solar, velocidad del viento y temperatura para
          identificar las zonas con mejores condiciones naturales para nuevas
          instalaciones renovables.
        </p>

        {/* Badge de fuente */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          <span className="badge badge-green">Atlas IDEAM — UPME</span>
          <span className="badge badge-purple">Región Caribe 2024</span>
        </div>

        {/* Tabs de navegación interna */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 28,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: 16,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTabActiva(t.id)}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.2s",
                background:
                  tabActiva === t.id ? "rgba(139,92,246,0.15)" : "transparent",
                borderColor:
                  tabActiva === t.id
                    ? "rgba(139,92,246,0.4)"
                    : "rgba(255,255,255,0.08)",
                color: tabActiva === t.id ? "#a78bfa" : "var(--text-muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab */}
        <div style={{ display: "grid", gap: 24 }}>
          {tabActiva === "resumen" && (
            <>
              <TablaResumen resumen={data.resumen} />
              <div className="grid-2">
                <GraficaRadar resumen={data.resumen} />
                <div
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 20,
                  }}
                >
                  <p className="section-label">¿Qué mide cada variable?</p>
                  {[
                    {
                      icono: "☀",
                      color: "#f59e0b",
                      titulo: "Radiación solar (kWh/m²)",
                      texto:
                        "Energía solar recibida por metro cuadrado al día. Determina la viabilidad y eficiencia de paneles fotovoltaicos.",
                    },
                    {
                      icono: "💨",
                      color: "#3b82f6",
                      titulo: "Velocidad del viento (m/s)",
                      texto:
                        "Velocidad media del viento. A partir de 5 m/s es viable para aerogeneradores; sobre 7 m/s es óptimo.",
                    },
                    {
                      icono: "🌡",
                      color: "#ef4444",
                      titulo: "Temperatura (°C)",
                      texto:
                        "Temperatura alta reduce eficiencia de paneles solares hasta un 0.4% por cada grado sobre 25°C.",
                    },
                  ].map(({ icono, color, titulo, texto }) => (
                    <div key={titulo} style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                        {icono}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color,
                            marginBottom: 4,
                          }}
                        >
                          {titulo}
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tabActiva === "series" && (
            <>
              <GraficaSeries
                series={data.series}
                variable="radiacion"
                label="Radiación solar"
                unidad="kWh/m²"
              />
              <GraficaSeries
                series={data.series}
                variable="viento"
                label="Velocidad del viento"
                unidad="m/s"
              />
              <GraficaSeries
                series={data.series}
                variable="temperatura"
                label="Temperatura promedio"
                unidad="°C"
              />
            </>
          )}

          {tabActiva === "zonas" && <ZonasOptimas zonas={data.zonas} />}
        </div>
        {data && <ConexionRetos resumen={data.resumen} />}
      </div>
    </section>
  );
}
