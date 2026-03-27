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
} from "recharts";
import { useMemo } from "react";

// ── Paleta por departamento ──────────────────────────────────────────────────
const COLORES_DEPTO = {
  Atlántico: "#8b5cf6",
  Cesar: "#10b981",
  "La Guajira": "#f59e0b",
  Magdalena: "#3b82f6",
};

// ── Tooltip personalizado ────────────────────────────────────────────────────
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
        minWidth: 180,
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: 8,
          fontSize: "0.75rem",
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
          <span style={{ fontWeight: 700 }}>
            {Number(p.value).toLocaleString()} MWh
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Gráfica de líneas: producción mensual por departamento ───────────────────
function GraficaLineas({ datos }) {
  // Pivotear: [{ mes, Atlántico, Cesar, ... }]
  const pivotado = useMemo(() => {
    const mapa = {};
    datos.forEach(({ mes, departamento, producción_mwh }) => {
      if (!mapa[mes]) mapa[mes] = { mes };
      mapa[mes][departamento] = (mapa[mes][departamento] || 0) + producción_mwh;
    });
    return Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [datos]);

  const departamentos = Object.keys(COLORES_DEPTO);

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <p className="section-label">Tendencia mensual</p>
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Producción mensual por departamento
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginBottom: 28,
        }}
      >
        MWh generados cada mes — solar + eólica combinados
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={pivotado}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="mes"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickFormatter={(v) => v.slice(5)} // solo muestra el mes
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.8rem", paddingTop: 16 }}
            formatter={(v) => (
              <span style={{ color: "var(--text-secondary)" }}>{v}</span>
            )}
          />
          {departamentos.map((depto) => (
            <Line
              key={depto}
              type="monotone"
              dataKey={depto}
              stroke={COLORES_DEPTO[depto]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: COLORES_DEPTO[depto], strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#050811" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Gráfica de barras: total por departamento y tecnología ───────────────────
function GraficaBarras({ datos }) {
  // Pivotear: [{ departamento, Solar, Eólica }]
  const pivotado = useMemo(() => {
    const mapa = {};
    datos.forEach(({ departamento, tecnología, producción_mwh }) => {
      if (!mapa[departamento]) mapa[departamento] = { departamento };
      mapa[departamento][tecnología] = producción_mwh;
    });
    return Object.values(mapa);
  }, [datos]);

  return (
    <div className="card">
      <p className="section-label">Comparativa</p>
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Solar vs Eólica por departamento
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginBottom: 28,
        }}
      >
        Producción total acumulada 2024
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={pivotado}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="departamento"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
            tickFormatter={(v) => v.split(" ")[0]} // "La Guajira" → "La"... mejor abreviamos
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.8rem", paddingTop: 12 }}
            formatter={(v) => (
              <span style={{ color: "var(--text-secondary)" }}>{v}</span>
            )}
          />
          <Bar
            dataKey="Solar"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey="Eólica"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Gráfica de barras horizontales: ranking total ────────────────────────────
function GraficaRanking({ datos }) {
  const ranking = useMemo(() => {
    const mapa = {};
    datos.forEach(({ departamento, producción_mwh }) => {
      mapa[departamento] = (mapa[departamento] || 0) + producción_mwh;
    });
    return Object.entries(mapa)
      .map(([departamento, total]) => ({ departamento, total }))
      .sort((a, b) => b.total - a.total);
  }, [datos]);

  const max = ranking[0]?.total || 1;

  return (
    <div className="card">
      <p className="section-label">Ranking</p>
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Líderes de producción
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginBottom: 28,
        }}
      >
        Producción total por departamento
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {ranking.map(({ departamento, total }, i) => {
          const pct = (total / max) * 100;
          const color = COLORES_DEPTO[departamento];
          return (
            <div key={departamento}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: `${color}22`,
                      border: `1px solid ${color}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{ color: "var(--text-primary)", fontWeight: 500 }}
                  >
                    {departamento}
                  </span>
                </div>
                <span style={{ color, fontWeight: 700 }}>
                  {total.toLocaleString()} MWh
                </span>
              </div>
              {/* Barra de progreso */}
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
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    borderRadius: 4,
                    transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Charts({ mensual, porDepto }) {
  if (!mensual || !porDepto) return null;

  return (
    <section id="charts">
      <div className="section">
        <p className="section-label">Análisis visual</p>
        <h2 className="section-title">Gráficas de producción</h2>
        <p className="section-subtitle">
          Evolución mensual, comparativa por tecnología y ranking de los cuatro
          departamentos de la Región 6.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Líneas — ancho completo */}
          <div style={{ display: "grid", gap: 24 }}>
            <GraficaLineas datos={mensual} />
          </div>

          {/* Barras + Ranking lado a lado */}
          <div className="grid-2">
            <GraficaBarras datos={porDepto} />
            <GraficaRanking datos={porDepto} />
          </div>
        </div>
      </div>
    </section>
  );
}
